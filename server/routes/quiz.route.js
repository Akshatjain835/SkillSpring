import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  generateQuiz,
  getQuiz,
  submitQuizAttempt,
} from "../controllers/quiz.controller.js";

const router = express.Router();

router.post(
  "/:courseId/lecture/:lectureId/generate",
  isAuthenticated,
  generateQuiz
);
router.get(
  "/:courseId/lecture/:lectureId",
  isAuthenticated,
  getQuiz
);
router.post(
  "/:courseId/lecture/:lectureId/submit",
  isAuthenticated,
  submitQuizAttempt
);

export default router;
