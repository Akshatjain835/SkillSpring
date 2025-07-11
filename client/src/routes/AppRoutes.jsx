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
        element: <Login />,
      },
      {
        path: "my-learning",
        element: <MyLearning />,
      },
      {
        path: "profile",
        element: <Profile />,
      },

      //admin routes
      {
         path:"admin",
         element:<Sidebar/>,
         children:[
            {
                path:"dashboard",
                element:<Dashboard/>
            },
            {
                path:"course",
                element:<CourseTable/>
            },
            {
                path:"course/create",
                element:<AddCourse/>
            }
         ]
      }
    ],
  },
];
