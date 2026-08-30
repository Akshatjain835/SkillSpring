import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCourseMutation } from '@/features/api/courseApi';
import { Loader2, ArrowLeft, PlusCircle, BookOpen } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();
  const navigate = useNavigate();

  const createCourseHandler = async () => {
    if (!courseTitle.trim() || !category) {
      toast.error("Please provide a course title and select a category.");
      return;
    }
    await createCourse({ courseTitle, category });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created successfully!");
      navigate("/admin/course");
    }
    if (error) {
      toast.error(error?.data?.message || "Failed to create course.");
    }
  }, [isSuccess, error, data, navigate]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/course")}
          className="rounded-xl gap-1 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <PlusCircle size={14} />
            <span>Course Setup</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create a New Course
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter a title and select a category for your new course to get started.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Course Title
            </Label>
            <Input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Master React & Next.js from Scratch"
              className="rounded-xl border-slate-200 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category
            </Label>
            <Select onValueChange={(val) => setCategory(val)}>
              <SelectTrigger className="w-full rounded-xl border-slate-200">
                <SelectValue placeholder="Select a course category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  <SelectLabel>Available Categories</SelectLabel>
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

          <div className="pt-4 flex items-center gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/course")}
              className="rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={createCourseHandler}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Course"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;