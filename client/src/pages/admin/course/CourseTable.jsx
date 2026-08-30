import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';
import { Edit, Plus, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetCreatorCourseQuery } from '@/features/api/courseApi';
import { Skeleton } from '@/components/ui/skeleton';

const CourseTable = () => {
  const { data, isLoading } = useGetCreatorCourseQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Your Courses
          </h1>
          <p className="text-xs text-slate-500">Manage, edit, or publish your created courses.</p>
        </div>

        <Button
          onClick={() => navigate(`create`)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 gap-2 shrink-0"
        >
          <Plus size={16} />
          Create New Course
        </Button>
      </div>

      {/* Courses Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-bold text-xs">Title</TableHead>
              <TableHead className="font-bold text-xs">Price</TableHead>
              <TableHead className="font-bold text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data?.courses || data.courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-400 text-xs">
                  No courses created yet. Click "Create New Course" above to get started!
                </TableCell>
              </TableRow>
            ) : (
              data.courses.map((course) => (
                <TableRow key={course._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <TableCell className="font-semibold text-xs text-slate-900 dark:text-white max-w-xs truncate">
                    {course.courseTitle}
                  </TableCell>
                  <TableCell className="font-bold text-xs">
                    {course?.coursePrice ? `$${course.coursePrice}` : "Free"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        course.isPublished
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl h-8 w-8 p-0"
                      onClick={() => navigate(`${course._id}`)}
                    >
                      <Edit size={16} className="text-blue-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseTable;