import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useGetPurchasedCoursesQuery } from '@/features/api/purchaseApi';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { data, isError, isLoading } = useGetPurchasedCoursesQuery();
  const [chartMode, setChartMode] = useState("course"); // "course" | "monthly"

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 text-center space-y-2">
        <h2 className="text-xl font-bold text-red-500">Failed to load analytics dashboard</h2>
        <p className="text-xs text-slate-500">Please check server connections or try again later.</p>
      </div>
    );
  }

  const purchasedCourse = data?.purchasedCourse || [];
  const courses = data?.courses || [];

  // 1. Overall Metrics Calculation
  const totalRevenue = purchasedCourse.reduce(
    (acc, item) => acc + (item.amount || item.courseId?.coursePrice || 0),
    0
  );

  const totalSales = purchasedCourse.length;

  const uniqueStudentIds = new Set(
    purchasedCourse
      .map((item) => item.userId?._id || item.userId)
      .filter(Boolean)
  );
  const totalUniqueStudents = uniqueStudentIds.size;

  const publishedCoursesCount = courses.filter((c) => c.isPublished).length;
  const draftCoursesCount = courses.length - publishedCoursesCount;

  // 2. Course-wise Aggregation
  const coursePerformanceMap = {};
  courses.forEach((c) => {
    coursePerformanceMap[c._id] = {
      id: c._id,
      title: c.courseTitle || "Untitled Course",
      category: c.category || "Uncategorized",
      price: c.coursePrice || 0,
      isPublished: c.isPublished,
      salesCount: 0,
      revenue: 0,
    };
  });

  purchasedCourse.forEach((item) => {
    const cId = item.courseId?._id || item.courseId;
    const itemAmount = item.amount || item.courseId?.coursePrice || 0;
    if (cId && coursePerformanceMap[cId]) {
      coursePerformanceMap[cId].salesCount += 1;
      coursePerformanceMap[cId].revenue += itemAmount;
    } else if (item.courseId?.courseTitle) {
      // Handles cases where courseId object is populated but not in instructor's creator list
      const key = item.courseId._id || item.courseId.courseTitle;
      if (!coursePerformanceMap[key]) {
        coursePerformanceMap[key] = {
          id: key,
          title: item.courseId.courseTitle,
          category: item.courseId.category || "General",
          price: item.courseId.coursePrice || itemAmount,
          isPublished: item.courseId.isPublished ?? true,
          salesCount: 0,
          revenue: 0,
        };
      }
      coursePerformanceMap[key].salesCount += 1;
      coursePerformanceMap[key].revenue += itemAmount;
    }
  });

  const coursePerformanceList = Object.values(coursePerformanceMap);

  const courseChartData = coursePerformanceList.map((item) => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 18)}...` : item.title,
    fullName: item.title,
    revenue: item.revenue,
    sales: item.salesCount,
  }));

  // 3. Monthly Sales Aggregation
  const monthlyMap = {};
  purchasedCourse.forEach((item) => {
    if (!item.createdAt) return;
    const date = new Date(item.createdAt);
    const monthKey = date.toLocaleString("en-US", { month: "short", year: "2-digit" });
    const itemAmount = item.amount || item.courseId?.coursePrice || 0;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, revenue: 0, sales: 0, rawDate: date };
    }
    monthlyMap[monthKey].revenue += itemAmount;
    monthlyMap[monthKey].sales += 1;
  });

  const monthlyChartData = Object.values(monthlyMap).sort(
    (a, b) => a.rawDate - b.rawDate
  );

  return (
    <div className="space-y-8">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Instructor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time authentic analytics, course performance breakdown, and revenue insights.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" /> Total lifetime earnings
            </p>
          </CardContent>
        </Card>

        {/* Total Sales */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Course Enrollments
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalSales}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Completed course purchases</p>
          </CardContent>
        </Card>

        {/* Unique Enrolled Students */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalUniqueStudents}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Unique active learners</p>
          </CardContent>
        </Card>

        {/* Total Courses */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Your Courses
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {courses.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {publishedCoursesCount} Published · {draftCoursesCount} Drafts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart Card */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Revenue Analytics
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {chartMode === "course"
                ? "Aggregate earnings by individual course"
                : "Monthly revenue and order volume trends"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <Button
              variant={chartMode === "course" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode("course")}
              className={`rounded-xl text-xs h-7 font-medium ${
                chartMode === "course"
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Layers size={13} className="mr-1.5" />
              By Course
            </Button>
            <Button
              variant={chartMode === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartMode("monthly")}
              className={`rounded-xl text-xs h-7 font-medium ${
                chartMode === "monthly"
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Calendar size={13} className="mr-1.5" />
              By Month
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {purchasedCourse.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <BarChart3 size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No purchase transactions recorded yet
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once students purchase your published courses, authentic revenue and enrollment metrics will render here automatically.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              {chartMode === "course" ? (
                <BarChart data={courseChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [
                      name === "revenue" ? `$${value}` : value,
                      name === "revenue" ? "Revenue" : "Sales Count",
                    ]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} name="revenue" />
                </BarChart>
              ) : (
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Grid: Course Performance & Recent Enrollments */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Course Performance Breakdown Table */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Course Performance Breakdown</span>
              <Badge variant="outline" className="rounded-xl text-[11px]">
                {coursePerformanceList.length} Courses
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Revenue and sales performance per course
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {coursePerformanceList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No courses created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Course</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Sales</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {coursePerformanceList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-white max-w-[180px] truncate">
                          <div>{item.title}</div>
                          <div className="text-[10px] text-slate-400">{item.category}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {item.isPublished ? (
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] rounded-lg">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] rounded-lg">
                              Draft
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-semibold">
                          {item.salesCount}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                          ${item.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Student Enrollments Table */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Recent Student Enrollments</span>
              <Badge variant="outline" className="rounded-xl text-[11px]">
                {purchasedCourse.length} Total
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Latest completed transactions and enrolled learners
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {purchasedCourse.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent enrollments recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Student</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {purchasedCourse.slice(0, 6).map((item, idx) => (
                      <tr key={item._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.userId?.name || "Enrolled Student"}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {item.userId?.email || "Student"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 max-w-[140px] truncate">
                          {item.courseId?.courseTitle || "Course"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ${(item.amount || item.courseId?.coursePrice || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
