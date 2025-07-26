import express from "express"
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js"
import courseRoute from "./routes/course.route.js"
import lectureRoute from "./routes/lecture.route.js"
import mediaRoute from "./routes/media.route.js"
import purchaseRouter from "./routes/purchaseCourse.route.js"
import courseProgressRoute from "./routes/courseProgress.route.js";



dotenv.config({});

// call database connection here

const app = express()

const PORT = process.env.PORT || 5000;

//default middleware
app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

connectDB();

//api
app.use("/api/v1/user", userRoute)
app.use("/api/v1/course", courseRoute)
app.use("/api/v1/course", lectureRoute)
app.use("/api/v1/media", mediaRoute)
app.use("/api/v1/purchase", purchaseRouter);
app.use("/api/v1/progress", courseProgressRoute);


app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`); 
})


