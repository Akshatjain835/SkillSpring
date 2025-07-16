import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { cancelOrder, captureOrder, createCheckoutSession, getAllPurchasedCourse, getCourseDetailWithPurchaseStatus } from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/paypal/capture").post(isAuthenticated, captureOrder);
router.post("/paypal/cancel", isAuthenticated, cancelOrder);

router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated,getAllPurchasedCourse);


export default router;