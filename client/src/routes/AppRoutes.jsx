import React from "react";
import Sidebar from "@/pages/admin/Sidebar";
import MainLayout from "@/layout/MainLayout";
import HeroSection from "@/pages/student/HeroSection";
import Courses from "@/pages/student/Courses";
import Login from "@/pages/Login";
import MyLearning from "@/pages/student/MyLearning";
import Profile from "@/pages/student/Profile";
import Dashboard from "@/pages/admin/Dashboard";
import CourseTable from "@/pages/admin/course/CourseTable";
import AddCourse from "@/pages/admin/course/AddCourse";
import EditCourse from "@/pages/admin/course/EditCourse";
import CreateLecture from "@/pages/admin/lecture/CreateLecture";
import EditLecture from "@/pages/admin/lecture/EditLecture";
import CourseDetail from "@/pages/student/CourseDetail";
import CourseProgress from "@/pages/student/CourseProgress";
import SearchPage from "@/pages/student/SearchPage";
import { AdminRoute, AuthenticatedUser, ProtectedRoute } from "@/components/ProtectedRoutes";
import PurchaseCourseProtectedRoute from "@/components/PurchaaseCourseProtectedRoute";


export const appRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        ),
      },
      {
        path: "login",
        element: (
          <AuthenticatedUser>
            <Login />
          </AuthenticatedUser>
        ),
      },
      {
        path: "my-learning",
        element: <MyLearning />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "course/search",
        element: (
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-detail/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-progress/:courseId",
        element: (
          <ProtectedRoute>
            <PurchaseCourseProtectedRoute>
              <CourseProgress />
            </PurchaseCourseProtectedRoute>
          </ProtectedRoute>
        ),
      },

      //admin routes
      {
        path: "admin",
        element: (
          <AdminRoute>
            <Sidebar />
          </AdminRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "course",
            element: <CourseTable />,
          },
          {
            path: "course/create",
            element: <AddCourse />,
          },
          {
            path: "course/:courseId",
            element: <EditCourse />,
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />,
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />,
          },
        ],
      },
    ],
  },
];
