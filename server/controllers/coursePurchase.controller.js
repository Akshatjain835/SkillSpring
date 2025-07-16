import { paypal, client } from "../helpers/paypal.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/Lecture.model.js";
import { User } from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: course.coursePrice.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: course.coursePrice.toFixed(2),
              },
            },
          },
          items: [
            {
              name: course.courseTitle,
              unit_amount: {
                currency_code: "USD",
                value: course.coursePrice.toFixed(2),
              },
              quantity: "1",
            },
          ],
        },
      ],
      application_context: {
        return_url: `http://localhost:5173/course-progress/${courseId}`,
        cancel_url: `http://localhost:5173/course-detail/${courseId}?canceled=true`,
      },
    });

    const response = await client().execute(request);
    const approvalURL = response.result.links.find(
      (link) => link.rel === "approve"
    ).href;

    newPurchase.paymentId = response.result.id;
    await newPurchase.save();
    // console.log(newPurchase);

    return res.status(200).json({
      success: true,
      url: approvalURL,
    });
  } catch (error) {
    console.error("PayPal Checkout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during PayPal checkout",
    });
  }
};

export const captureOrder = async (req, res) => {
  const userId = req.id;
  const { orderID, courseId, payerID } = req.body;

  try {
    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      paymentId: orderID,
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    purchase.status = "completed";
    purchase.payerId = payerID;
    await purchase.save();

    // Enroll user, unlock lectures, etc.
    await Lecture.updateMany(
      { _id: { $in: purchase.courseId.lectures } },
      { $set: { isPreviewFree: true } }
    );

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    res.status(200).json({ message: "Payment captured, course unlocked." });
  } catch (err) {
    console.error("Capture error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const cancelOrder = async (req, res) => {
  const userId = req.id;
  const { paymentId } = req.body;

  try {
    const purchase = await CoursePurchase.findOne({ userId, paymentId });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    purchase.status = "failed";
    await purchase.save();

    res.status(200).json({ message: "Purchase marked as failed" });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });
    // console.log(purchased, "puc");

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }
};
