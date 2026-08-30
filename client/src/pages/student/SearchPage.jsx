import React, { useState } from "react";
import Filter from "./Filter";
import { Skeleton } from "@/components/ui/skeleton";
import SearchResult from "./SearchResult";
import { Link, useSearchParams } from "react-router-dom";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { AlertCircle, Search, BookOpen, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const { data, isLoading } = useGetSearchCourseQuery({
    searchQuery: query,
    categories: selectedCategories,
    sortByPrice,
  });

  const isEmpty = !isLoading && data?.courses?.length === 0;

  const handleFilterChange = (categories, price) => {
    setSelectedCategories(categories);
    setSortByPrice(price);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Compass size={14} />
            <span>Course Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {query ? `Search Results for "${query}"` : "All Courses"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {data?.courses?.length || 0} course{data?.courses?.length === 1 ? "" : "s"} found matching your criteria.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        <Filter handleFilterChange={handleFilterChange} />
        <div className="flex-1 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <CourseSkeleton key={idx} />
            ))
          ) : isEmpty ? (
            <CourseNotFound query={query} />
          ) : (
            Array.isArray(data?.courses) &&
            data.courses.map((course) => <SearchResult key={course._id} course={course} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

const CourseNotFound = ({ query }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3">
      <div className="h-16 w-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/60">
        <AlertCircle size={32} />
      </div>
      <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
        No Courses Found
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        We couldn't find any courses matching {query ? `"${query}"` : "your filter criteria"}. Try clearing filters or searching for different keywords.
      </p>
      <Link to="/" className="pt-2">
        <Button variant="outline" className="rounded-xl text-xs font-semibold">
          Explore All Home Courses
        </Button>
      </Link>
    </div>
  );
};

const CourseSkeleton = () => {
  return (
    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <Skeleton className="aspect-video w-full sm:w-48 rounded-2xl" />
      <div className="flex-1 space-y-3 w-full">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
      </div>
    </div>
  );
};

