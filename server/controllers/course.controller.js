import { Course } from "../models/course.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
    try {


        const { courseTitle, category } = req.body;

        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course title and category is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        });

        return res.status(201).json({
            course,
            message: "Course created."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const getCreatorCourses = async (req, res) => {

    try {

        const userId = req.id;
        const courses = await Course.find({ creator: userId });

        if (!courses) {
            return res.status(404).json({
                courses: [],
                message: "Course not found"
            })
        };

        return res.status(200).json({
            courses,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const editCourse = async (req, res) => {

    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        // console.log(req.body);
        const thumbnail = req.file;

        let course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }

        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }

            // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        // console.log(course.courseThumbnail)


        const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url };
        // console.log(updateData);
        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return res.status(200).json({
            course,
            message: "Course updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const getCourseById = async (req, res) => {

    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }

        return res.status(200).json({
            course
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course by id"
        })

    }
}


//publish and unpublish course
export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        // console.log(statusMessage);
        return res.status(200).json({
            message: `Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update status"
        })
    }
}

export const searchCourse = async (req, res) => {
    try {
        let { query = "", categories = [], sortByPrice = "" } = req.query;

        // Safely parse categories string or array into non-empty strings
        let parsedCategories = [];
        if (typeof categories === "string") {
            parsedCategories = categories
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
        } else if (Array.isArray(categories)) {
            parsedCategories = categories
                .map((c) => (typeof c === "string" ? c.trim() : c))
                .filter(Boolean);
        }

        const queryCriteria = {
            isPublished: true,
        };

        // 1. Text Search Filter (Title, SubTitle, Category)
        if (query && query.trim()) {
            const searchRegex = new RegExp(
                query.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
                "i"
            );
            queryCriteria.$or = [
                { courseTitle: searchRegex },
                { subTitle: searchRegex },
                { category: searchRegex },
            ];
        }

        // 2. Category Checkbox Filter (Case-insensitive & flexible spaces)
        if (parsedCategories.length > 0) {
            const categoryRegexes = parsedCategories.map((cat) => {
                const escaped = cat.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                const flexiblePattern = escaped.replace(/\s+/g, "\\s*");
                return new RegExp(`^${flexiblePattern}$`, "i");
            });
            queryCriteria.category = { $in: categoryRegexes };
        }

        // 3. Price Sorting
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1;
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1;
        } else {
            sortOptions.createdAt = -1;
        }

        const courses = await Course.find(queryCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || [],
        });
    } catch (error) {
        console.error("searchCourse Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};



export const getPublishedCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" });
        // console.log(courses);
        if (!courses) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get published courses"
        })
    }
}
export const deleteCourseController = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await course.deleteOne(); // or await Course.findByIdAndDelete(courseId);

        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error("Error deleting course:", err);
        return res.status(500).json({ message: "Server error" });
    }
};