import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  chatWithTutor,
  processLectureTranscript,
} from "../controllers/tutor.controller.js";

const router = express.Router();

router.post("/:courseId/chat", isAuthenticated, chatWithTutor);
router.post(
  "/:courseId/lecture/:lectureId/process",
  isAuthenticated,
  processLectureTranscript
);

export default router;
