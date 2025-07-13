import express from "express";
import { createLecture, editLecture, getCourseLecture, getLectureById, removeLecture } from "../controllers/lecture.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const router = express.Router();


router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);


export default router;