import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Star } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const SearchResult = ({ course }) => {
  const levelColors = {
    Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200",
    Medium: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200",
    Advance: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200",
  };

  const badgeStyle = levelColors[course?.courseLevel] || "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";

  return (
    <Link
      to={`/course-detail/${course._id}`}
      className="group block p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 mb-4"
    >
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
          <div className="relative aspect-video w-full sm:w-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img
              src={course?.courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60"}
              alt={course?.courseTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                {course?.courseLevel || "All Levels"}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {course?.category || "Development"}
              </span>
            </div>

            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {course?.courseTitle}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {course?.subTitle}
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={course?.creator?.photoUrl} />
                  <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                    {course?.creator?.name ? course.creator.name.slice(0, 2).toUpperCase() : "SS"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {course?.creator?.name}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <BookOpen size={12} />
                <span>{course?.lectures?.length || 0} Lectures</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {course?.coursePrice ? `$${course.coursePrice}` : "Free"}
          </span>
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SearchResult;


