import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Sparkles } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

function Course({ course }) {
  const levelColors = {
    Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    Medium: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    Advance: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  };

  const badgeStyle = levelColors[course?.courseLevel] || "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200";

  return (
    <Link to={`/course-detail/${course._id}`} className="group block">
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500/40 transition-all duration-300 flex flex-col h-full">
        {/* Thumbnail Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={course.courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60"}
            alt={course.courseTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Level Badge Overlay */}
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${badgeStyle}`}>
              {course.courseLevel || "All Levels"}
            </span>
          </div>

          {/* Price Badge Overlay */}
          <div className="absolute bottom-3 right-3">
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-slate-950/80 text-white backdrop-blur-md border border-white/20 shadow-md">
              {course.coursePrice ? `$${course.coursePrice}` : "Free"}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <CardContent className="p-5 flex flex-col flex-1 justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                {course.category || "Development"}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-medium">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>4.8</span>
              </div>
            </div>

            <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
              {course.courseTitle}
            </h3>
          </div>

          {/* Creator & Lectures Count Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-7 w-7 border border-blue-500/20">
                <AvatarImage src={course.creator?.photoUrl} alt={course.creator?.name} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {course.creator?.name ? course.creator.name.slice(0, 2).toUpperCase() : "SS"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-xs text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                {course.creator?.name || "Instructor"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <BookOpen size={14} />
              <span>{course.lectures?.length || 0} Lectures</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Course;

