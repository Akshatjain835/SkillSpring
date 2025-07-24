import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const LECTURE_API = "http://localhost:8080/api/v1/course";

export const lectureApi = createApi({
  reducerPath: "lectureApi",
  tagTypes: ["Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: LECTURE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoUrl,
        publicId,
        isPreviewFree,
        courseId,
      }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle, videoUrl, publicId, isPreviewFree },
      }),
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoUrl,
        publicId,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoUrl, publicId, isPreviewFree },
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
  }),
});

export const {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
} = lectureApi;
