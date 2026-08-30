import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeInfo, PlayCircle, Lock, Users, Calendar, Award, Sparkles, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BuyCourseButton from "@/components/BuyCourseButton";
import { useCancelPurchaseMutation, useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const location = useLocation();
  const [cancelPurchase] = useCancelPurchaseMutation();
  const cancelHandled = useRef(false);

  useEffect(() => {
    if (cancelHandled.current) return;
    const searchParams = new URLSearchParams(location.search);
    const canceled = searchParams.get("canceled");
    const paymentId = searchParams.get("token");
    if (canceled && paymentId) {
      cancelHandled.current = true;
      cancelPurchase({ paymentId })
        .unwrap()
        .then(() => {
          toast.info("Purchase cancelled.");
        })
        .catch(() => {
          toast.error("Failed to cancel purchase.");
        });
    }
  }, [location.search, cancelPurchase]);

  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6 space-y-8">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !data?.course) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Failed to load course details</h2>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  const previewLecture = course.lectures?.find(l => l.isPreviewFree) || course.lectures?.[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Dark Modern Banner Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/30 text-blue-400 border border-blue-500/30">
              {course.courseLevel || "All Levels"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              {course.category || "Development"}
            </span>
          </div>

          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            {course?.courseTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {course?.subTitle}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-400">
            <p>
              Created by <span className="font-semibold text-blue-300">{course?.creator?.name}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-blue-400" />
              <span>Updated {course?.createdAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={16} className="text-indigo-400" />
              <span>{course?.enrolledStudents?.length || 0} enrolled students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Description & Course Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold text-2xl text-slate-900 dark:text-white">About This Course</h2>
            <div
              className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: course?.description }}
            />
          </div>

          {/* Curriculum Section */}
          <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span>Course Content</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {course.lectures?.length || 0} Lectures
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
              {course.lectures?.map((lecture, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      {(lecture.isPreviewFree || purchased) ? (
                        <PlayCircle size={18} />
                      ) : (
                        <Lock size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{lecture.lectureTitle}</p>
                      {lecture.isPreviewFree && !purchased && (
                        <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Free Preview</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Preview & Buy Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-5 space-y-4">
                {previewLecture?.videoUrl ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 relative shadow-inner">
                    <video
                      src={previewLecture.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <img src={course.courseThumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {course.coursePrice ? `$${course.coursePrice}` : "Free"}
                  </span>
                  <p className="text-xs text-muted-foreground">Full lifetime access with certificate</p>
                </div>

                <Separator />

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>Access to all video lectures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>24/7 AI Course Tutor Assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>Automated AI Knowledge Quizzes</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                {purchased ? (
                  <Button
                    onClick={handleContinueCourse}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl h-12 font-bold shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Continue Course
                  </Button>
                ) : (
                  <div className="w-full">
                    <BuyCourseButton courseId={courseId} />
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

