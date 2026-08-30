import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, BookOpen, Bot, Award, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/course/search");
    }
  };

  const popularTags = ["Next.js", "AI & ML", "React", "Python", "Data Science", "Web Development"];

  return (
    <div className="relative overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/80 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
      {/* Background Subtle Gradient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto text-center space-y-8">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Find the Best Courses for You on <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            E-Learning Platform
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Discover, learn, and upskill with our wide range of interactive courses and AI-powered tutor assistance.
        </p>

        {/* Search Bar Container */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={searchHandler}
            className="flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-blue-500/5 dark:shadow-none focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-300"
          >
            <div className="pl-4 pr-2 text-slate-400">
              <Search size={20} />
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses, skills, or topics..."
              className="flex-grow border-none bg-transparent focus-visible:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm md:text-base h-12"
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 h-12 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all duration-200 shrink-0 gap-2"
            >
              <span>Search</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-slate-500 font-medium">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/course/search?query=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Floating Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-white text-sm">Curated Courses</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Beginner to Advanced</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bot size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-white text-sm">AI Course Tutor</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Instant answers from video</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-white text-sm">Automated Quizzes</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track knowledge & score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;

