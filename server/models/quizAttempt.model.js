import mongoose from "mongoose";

const answerResultSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  studentAnswer: { type: String, default: "" },
  score: { type: Number, required: true }, // 0-1
  feedback: { type: String, default: "" },
  correctAnswer: { type: String }, // revealed post-grading
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: [answerResultSchema],
    totalScore: { type: Number, required: true }, // 0-1 average across questions
  },
  { timestamps: true }
);

quizAttemptSchema.index({ quizId: 1, userId: 1 });

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
