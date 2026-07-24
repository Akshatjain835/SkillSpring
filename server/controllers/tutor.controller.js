import { Course } from "../models/course.model.js";
import { Lecture } from "../models/Lecture.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { askTutor } from "../agents/tutorGraph.js";
import { generateAndStoreTranscript } from "../services/transcriptService.js";

// POST /api/v1/tutor/:courseId/chat
export const chatWithTutor = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Gate access: only the course creator or a paying, completed purchaser
    // can query the tutor for this course's content.
    const isCreator = course.creator.toString() === userId;
    const hasPurchased = await CoursePurchase.findOne({
      courseId,
      userId,
      status: "completed",
    });

    if (!isCreator && !hasPurchased) {
      return res
        .status(403)
        .json({ message: "Enroll in this course to use the AI tutor." });
    }

    const { answer, sources, retriesUsed } = await askTutor({
      courseId,
      question: question.trim(),
    });

    return res.status(200).json({ answer, sources, retriesUsed });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "The AI tutor failed to respond. Please try again." });
  }
};

// POST /api/v1/tutor/:courseId/lecture/:lectureId/process
// Instructor-only: transcribes + indexes a lecture so the tutor can use it.
export const processLectureTranscript = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, lectureId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }
    if (course.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Only the course creator can process transcripts." });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture || !lecture.videoUrl) {
      return res
        .status(404)
        .json({ message: "Lecture or its video was not found." });
    }

    const result = await generateAndStoreTranscript({
      courseId,
      lectureId,
      lectureTitle: lecture.lectureTitle,
      videoUrl: lecture.videoUrl,
    });

    return res.status(200).json({
      message: "Transcript processed and indexed for the AI tutor.",
      ...result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to process transcript." });
  }
};
