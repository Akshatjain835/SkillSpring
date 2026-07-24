import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const TUTOR_API = `${import.meta.env.VITE_API_URL}/api/v1/tutor`;

export const tutorApi = createApi({
  reducerPath: "tutorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: TUTOR_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    askTutor: builder.mutation({
      query: ({ courseId, question }) => ({
        url: `/${courseId}/chat`,
        method: "POST",
        body: { question },
      }),
    }),
    processLectureTranscript: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/process`,
        method: "POST",
      }),
    }),
  }),
});

export const { useAskTutorMutation, useProcessLectureTranscriptMutation } =
  tutorApi;
