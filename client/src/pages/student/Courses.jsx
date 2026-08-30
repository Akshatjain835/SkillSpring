import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { Sparkles, BookOpen, AlertCircle } from "lucide-react";

function Courses() {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();

  if (isError) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl mb-4 border border-red-200 dark:border-red-800">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Failed to load courses</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please check your internet connection or backend server status.</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Sparkles size={14} />
            <span>Featured Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore Our Top Courses
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Handpicked interactive courses designed by industry experts to take your skills to the next level.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : data?.courses?.length > 0 ? (
            data.courses.map((course) => (
              <Course key={course._id} course={course} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
              <BookOpen className="mx-auto text-slate-400" size={40} />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No Courses Available Yet</h3>
              <p className="text-sm text-slate-500">Check back soon for new course releases from our instructors.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Courses;

const CourseSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-4">
      <Skeleton className="w-full aspect-video rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

