import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = `${import.meta.env.VITE_API_URL}/api/v1/purchase`;

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    captureOrder: builder.mutation({
      query: (body) => ({
        url: "/paypal/capture",
        method: "POST",
        body,
      }),
    }),
    cancelPurchase: builder.mutation({
      query: ({ paymentId }) => ({
        url: "/paypal/cancel",
        method: "POST",
        body: { paymentId },
      }),
    }),

    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useCaptureOrderMutation,
  useCancelPurchaseMutation,
  useGetPurchasedCoursesQuery,
} = purchaseApi;
