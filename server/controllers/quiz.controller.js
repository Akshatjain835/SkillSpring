import { Course } from "../models/course.model.js";
import { Lecture } from "../models/Lecture.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";
import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { generateQuizQuestions } from "../agents/quizGenerationGraph.js";
import { gradeShortAnswer } from "../agents/gradingGraph.js";

async function assertEnrolledOrCreator(course, userId) {
  const isCreator = course.creator.toString() === userId;
  if (isCreator) return true;
  const purchase = await CoursePurchase.findOne({
    courseId: course._id,
    userId,
    status: "completed",
  });
  return Boolean(purchase);
}

// POST /api/v1/quiz/:courseId/lecture/:lectureId/generate  (creator only)
export const generateQuiz = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, lectureId } = req.params;
    const { numQuestions = 5 } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });
    if (course.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the course creator can generate a quiz." });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found." });
    if (lecture.courseId && lecture.courseId.toString() !== courseId) {
      return res.status(400).json({ message: "Lecture does not belong to this course." });
    }

    const chunks = await TranscriptChunk.find({ lectureId }).sort({ chunkIndex: 1 }).lean();
    if (chunks.length === 0) {
      return res.status(400).json({
        message:
          'This lecture has no processed transcript yet. Click "Process for AI Tutor" first.',
      });
    }

    const transcriptContext = chunks.map((c) => c.chunkText).join("\n");

    const { questions, retriesUsed, passedCritique, usedFallback } = await generateQuizQuestions({
      lectureTitle: lecture.lectureTitle,
      transcriptContext,
      numQuestions: Math.min(Math.max(Number(numQuestions) || 5, 3), 10),
    });

    if (questions.length === 0) {
      return res
        .status(500)
        .json({ message: "The quiz generator could not produce valid questions. Try again." });
    }

    const fallbackMessage = usedFallback
      ? "The quiz was generated from a fallback template because the AI service is currently unavailable or rate-limited."
      : null;

    const quiz = await Quiz.findOneAndUpdate(
      { lectureId },
      { courseId, lectureId, lectureTitle: lecture.lectureTitle, questions },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: fallbackMessage || "Quiz generated.",
      quiz,
      retriesUsed,
      passedCritique,
    });
  } catch (error) {
    console.error("generateQuiz error:", error?.message || error);
    return res.status(500).json({
      message: error?.message || "Failed to generate quiz.",
    });
  }
};

// GET /api/v1/quiz/:courseId/lecture/:lectureId  (enrolled or creator)
// Never leaks correctAnswer to the client before submission.
export const getQuiz = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, lectureId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const allowed = await assertEnrolledOrCreator(course, userId);
    if (!allowed) {
      return res.status(403).json({ message: "Enroll in this course to view its quizzes." });
    }

    const quiz = await Quiz.findOne({ lectureId }).lean();
    if (!quiz) {
      return res.status(404).json({ message: "No quiz exists for this lecture yet." });
    }

    const sanitizedQuestions = quiz.questions.map((q, i) => ({
      index: i,
      questionText: q.questionText,
      type: q.type,
      options: q.options || [],
    }));

    return res.status(200).json({
      quizId: quiz._id,
      lectureTitle: quiz.lectureTitle,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to load quiz." });
  }
};

// POST /api/v1/quiz/:courseId/lecture/:lectureId/submit  (enrolled)
// body: { answers: [{ questionIndex, studentAnswer }] }
export const submitQuizAttempt = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, lectureId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required." });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const allowed = await assertEnrolledOrCreator(course, userId);
    if (!allowed) {
      return res.status(403).json({ message: "Enroll in this course to take its quizzes." });
    }

    const quiz = await Quiz.findOne({ lectureId }).lean();
    if (!quiz) return res.status(404).json({ message: "No quiz exists for this lecture." });

    const gradedAnswers = [];

    for (const submitted of answers) {
      const question = quiz.questions[submitted.questionIndex];
      if (!question) continue;

      const studentStr = (submitted.studentAnswer || "").toString().trim();
      const modelStr = (question.correctAnswer || "").toString().trim();

      if (question.type === "mcq") {
        const isCorrect = studentStr.toLowerCase() === modelStr.toLowerCase();

        gradedAnswers.push({
          questionIndex: submitted.questionIndex,
          studentAnswer: studentStr,
          score: isCorrect ? 1 : 0,
          feedback: isCorrect
            ? "Correct."
            : `Not quite — the correct answer is "${modelStr}".`,
          correctAnswer: modelStr,
        });
      } else {
        // short_answer — this is where the grading LangGraph runs
        try {
          const { score, feedback } = await gradeShortAnswer({
            questionText: question.questionText,
            correctAnswer: modelStr,
            studentAnswer: studentStr,
            sourceExcerpt: question.sourceExcerpt,
          });

          gradedAnswers.push({
            questionIndex: submitted.questionIndex,
            studentAnswer: studentStr,
            score,
            feedback,
            correctAnswer: modelStr,
          });
        } catch {
          const isExact = studentStr.toLowerCase() === modelStr.toLowerCase();
          gradedAnswers.push({
            questionIndex: submitted.questionIndex,
            studentAnswer: studentStr,
            score: isExact ? 1 : 0,
            feedback: isExact
              ? "Correct answer."
              : `Completed attempt. Model answer: "${modelStr}".`,
            correctAnswer: modelStr,
          });
        }
      }
    }

    const totalScore =
      gradedAnswers.length > 0
        ? gradedAnswers.reduce((sum, a) => sum + a.score, 0) / gradedAnswers.length
        : 0;

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      userId,
      answers: gradedAnswers,
      totalScore,
    });

    return res.status(200).json({
      message: "Quiz graded.",
      attemptId: attempt._id,
      totalScore,
      answers: gradedAnswers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to grade quiz." });
  }
};
