import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const QUIZ_API = `${import.meta.env.VITE_API_URL}/api/v1/quiz`;

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({
    baseUrl: QUIZ_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Quiz"],
  endpoints: (builder) => ({
    generateQuiz: builder.mutation({
      query: ({ courseId, lectureId, numQuestions }) => ({
        url: `/${courseId}/lecture/${lectureId}/generate`,
        method: "POST",
        body: { numQuestions },
      }),
      invalidatesTags: ["Quiz"],
    }),
    getQuiz: builder.query({
      query: ({ courseId, lectureId }) => `/${courseId}/lecture/${lectureId}`,
      providesTags: ["Quiz"],
    }),
    submitQuizAttempt: builder.mutation({
      query: ({ courseId, lectureId, answers }) => ({
        url: `/${courseId}/lecture/${lectureId}/submit`,
        method: "POST",
        body: { answers },
      }),
    }),
  }),
});

export const {
  useGenerateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizAttemptMutation,
} = quizApi;
