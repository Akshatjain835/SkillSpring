import RichTextEditor from "@/components/common/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteCourseMutation,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Trash2, Globe, FileText, Image as ImageIcon, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    description: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });

  const params = useParams();
  const courseId = params.courseId;

  const {
    data: courseByIdData,
    isLoading: courseByIdLoading,
    refetch,
  } = useGetCourseByIdQuery(courseId);
  const [deleteCourse, { isLoading: deleteLoading }] = useDeleteCourseMutation();
  const [publishCourse, { isLoading: publishLoading }] = usePublishCourseMutation();

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [editCourse, { data, isLoading, isSuccess, error }] = useEditCourseMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData?.course;
      setInput({
        courseTitle: course.courseTitle ?? "",
        subTitle: course.subTitle ?? "",
        description: course.description ?? "",
        category: course.category ?? "",
        courseLevel: course.courseLevel ?? "",
        coursePrice: course.coursePrice ?? "",
        courseThumbnail: "",
      });
      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);
      }
    }
  }, [courseByIdData]);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({
      ...input,
      [name]: value,
    });
  };

  const selectCategory = (value) => {
    setInput({
      ...input,
      category: value,
    });
  };

  const selectCourseLevel = (value) => {
    setInput({
      ...input,
      courseLevel: value,
    });
  };

  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", input.description);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice);
    if (input.courseThumbnail) {
      formData.append("courseThumbnail", input.courseThumbnail);
    }

    await editCourse({ formData, courseId });
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query: action });
      if (response.data) {
        refetch();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update publish status");
    }
  };

  const removeCourseHandler = async () => {
    if (!window.confirm("Are you sure you want to delete this course permanently?")) return;

    try {
      const res = await deleteCourse(courseId).unwrap();
      toast.success(res.message || "Course deleted successfully.");
      navigate("/admin/course");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete course");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course details saved successfully!");
      refetch();
    }
    if (error) {
      toast.error(error?.data?.message || "Failed to update course.");
    }
  }, [isSuccess, error, data, refetch]);

  if (courseByIdLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const course = courseByIdData?.course;

  return (
    <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Basic Course Details
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Edit your course information, price, and thumbnail.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={course?.lectures?.length === 0 || publishLoading}
            variant="outline"
            onClick={() => publishStatusHandler(course?.isPublished ? "false" : "true")}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <Globe size={14} />
            {course?.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button
            disabled={deleteLoading}
            onClick={removeCourseHandler}
            variant="destructive"
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <Trash2 size={14} />
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Course Title
            </Label>
            <Input
              type="text"
              name="courseTitle"
              value={input.courseTitle}
              onChange={changeEventHandler}
              placeholder="e.g. Complete Web Development Bootcamp"
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subtitle
            </Label>
            <Input
              type="text"
              name="subTitle"
              value={input.subTitle}
              onChange={changeEventHandler}
              placeholder="e.g. Learn HTML, CSS, JS, React & Node.js with hands-on projects"
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Course Description
            </Label>
            <RichTextEditor input={input} setInput={setInput} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </Label>
              <Select value={input.category} onValueChange={selectCategory}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="Next JS">Next JS</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                    <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                    <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                    <SelectItem value="Javascript">Javascript</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Docker">Docker</SelectItem>
                    <SelectItem value="MongoDB">MongoDB</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Course Level
              </Label>
              <Select value={input.courseLevel} onValueChange={selectCourseLevel}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectLabel>Levels</SelectLabel>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Medium">Intermediate</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Price (USD $)
              </Label>
              <Input
                type="number"
                name="coursePrice"
                value={input.coursePrice}
                onChange={changeEventHandler}
                placeholder="49"
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Course Thumbnail
            </Label>
            <Input
              type="file"
              onChange={selectThumbnail}
              accept="image/*"
              className="rounded-xl border-slate-200 text-xs"
            />
            {previewThumbnail && (
              <div className="mt-3 relative w-48 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={previewThumbnail}
                  className="w-full h-full object-cover"
                  alt="Course Thumbnail Preview"
                />
              </div>
            )}
          </div>

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/course")}
              className="rounded-xl text-xs font-semibold"
            >
              Back
            </Button>
            <Button
              disabled={isLoading}
              onClick={updateCourseHandler}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseTab;

