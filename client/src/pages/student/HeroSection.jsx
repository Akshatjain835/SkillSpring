import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-blue-500 to to-indigo-600 dark:from-gray-800 dark:to-gray-900 py-20 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-4xl font-bold mb-4">
          Find the best courses for you.
        </h1>
        <p className="text-gray-200 dark:text-gray-400 mb-8">
          Discover, Learn, and Upskill with our wide range of courses.
        </p>
        <form
          action=""
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mb-6 mx-auto"
        >
          <Input
            type="text"
            placeholder="Search Courses..."
            className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Button className="bg-blue-600 dark:bg-blue-800 text-white px-6 py-3 rounded-r-full hover:bg-blue-700 dark:hover:bg-blue-900">
            Search
          </Button>
        </form>
        <Button className="bg-white dark:bg-gray-800 rounded-full text-blue-700 hover:bg-gray-300">
          Explore Courses
        </Button>
      </div>
    </div>
  );
}

export default HeroSection;
