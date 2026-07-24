import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ["mcq", "short_answer"], required: true },
  options: [{ type: String }], // populated only for type "mcq"
  correctAnswer: { type: String, required: true }, // option text for mcq, model answer for short_answer
  sourceExcerpt: { type: String }, // transcript excerpt the question is grounded in
});

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      unique: true, // one quiz per lecture; regenerating overwrites it
    },
    lectureTitle: { type: String },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
