import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { BookOpen, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

function MyLearning() {
  const { data, isLoading, refetch } = useLoadUserQuery();
  const myLearning = data?.user?.enrolledCourses || [];

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen size={14} />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            My Learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your ongoing courses, watch video lectures, and take AI quizzes.
          </p>
        </div>
      </div>

      <div className="my-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : myLearning.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen size={32} />
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">You aren't enrolled in any courses yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Explore our wide variety of courses and start learning today!
            </p>
            <Link to="/course/search" className="inline-block pt-2">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2 font-bold shadow-md">
                <Compass size={16} />
                Explore Course Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {myLearning.map((course, index) => (
              <Course key={index} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLearning;

