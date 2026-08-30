import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import QuizPlayer from "@/components/QuizPlayer";
import CourseTutorChat from "@/components/CourseTutorChat";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { useCaptureOrderMutation } from "@/features/api/purchaseApi";
import { CheckCircle, CheckCircle2, CirclePlay, Sparkles, BookOpen, HelpCircle, Trophy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

function CourseProgress() {
  const { courseId } = useParams();
  const location = useLocation();
  const [captureOrder] = useCaptureOrderMutation();
  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();

  const [currentLecture, setCurrentLecture] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const orderID = query.get("token");
    const payerID = query.get("PayerID");

    if (orderID && payerID && courseId) {
      captureOrder({
        orderID,
        payerID,
        courseId,
        amount: 49.99,
      });
    }
  }, [location, courseId, captureOrder]);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData?.message || "Course completed!");
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData?.message || "Status updated.");
    }
  }, [completedSuccess, inCompletedSuccess, refetch, markCompleteData, markInCompleteData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6 space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[450px] rounded-3xl" />
          <Skeleton className="h-[450px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Failed to load course learning content</h2>
        <p className="text-sm text-slate-500">Please make sure you have access to this course.</p>
      </div>
    );
  }

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, lectures } = courseDetails;

  const activeLecture = currentLecture || (lectures && lectures[0]);
  const activeLectureId = activeLecture?._id;

  const completedCount = progress.filter((p) => p.viewed).length;
  const totalLectures = lectures?.length || 1;
  const progressPercent = Math.round((completedCount / totalLectures) * 100);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    if (!lectureId) return;
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    handleLectureProgress(lecture._id);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const currentLectureIndex = lectures?.findIndex((l) => l._id === activeLectureId);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Info & Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Learning Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {courseTitle}
            </h1>
          </div>

          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
            className={completed ? "rounded-xl border-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md"}
          >
            {completed ? (
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Course Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold">
                <Trophy className="h-4 w-4" />
                <span>Mark Course Complete</span>
              </div>
            )}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Course Completion: {completedCount} / {totalLectures} lectures</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* Grid: Video Player + Tabs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Player Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video relative">
            {activeLecture?.videoUrl ? (
              <video
                key={activeLecture._id}
                src={activeLecture.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
                onPlay={() => handleLectureProgress(activeLecture._id)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No video preview available for this lecture.
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Lecture {currentLectureIndex >= 0 ? currentLectureIndex + 1 : 1} of {totalLectures}
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeLecture?.lectureTitle}
            </h2>
          </div>
        </div>

        {/* Right Sidebar Tabs (Curriculum, AI Tutor, Quiz) */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="lectures" className="w-full space-y-4">
            <TabsList className="grid grid-cols-3 w-full p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <TabsTrigger value="lectures" className="rounded-xl text-xs font-semibold gap-1">
                <BookOpen size={14} />
                <span>Lectures</span>
              </TabsTrigger>
              <TabsTrigger value="tutor" className="rounded-xl text-xs font-semibold gap-1">
                <Sparkles size={14} className="text-blue-500" />
                <span>AI Tutor</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="rounded-xl text-xs font-semibold gap-1">
                <HelpCircle size={14} className="text-purple-500" />
                <span>Quiz</span>
              </TabsTrigger>
            </TabsList>

            {/* Lectures List */}
            <TabsContent value="lectures" className="m-0">
              <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardContent className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
                  {lectures?.map((lecture, idx) => {
                    const isSelected = lecture._id === activeLectureId;
                    const isDone = isLectureCompleted(lecture._id);

                    return (
                      <div
                        key={lecture._id}
                        onClick={() => handleSelectLecture(lecture)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                          isSelected
                            ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 shadow-sm"
                            : "bg-slate-50/50 dark:bg-slate-900/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-2 truncate">
                          {isDone ? (
                            <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                          ) : (
                            <CirclePlay size={20} className={isSelected ? "text-blue-600 shrink-0" : "text-slate-400 shrink-0"} />
                          )}
                          <div className="truncate">
                            <p className={`text-xs font-semibold truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`}>
                              {idx + 1}. {lecture.lectureTitle}
                            </p>
                          </div>
                        </div>

                        {isDone && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 text-[10px]">
                            Done
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Course Tutor Chat Tab */}
            <TabsContent value="tutor" className="m-0">
              <CourseTutorChat courseId={courseId} />
            </TabsContent>

            {/* Quiz Player Tab */}
            <TabsContent value="quiz" className="m-0">
              <QuizPlayer courseId={courseId} lectureId={activeLectureId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default CourseProgress;

