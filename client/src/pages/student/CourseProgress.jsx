import { useCaptureOrderMutation } from '@/features/api/purchaseApi';
import React, { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom';

function CourseProgress() {
  const { courseId } = useParams();
  const location = useLocation();
  const [captureOrder] = useCaptureOrderMutation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const orderID = query.get("token");
    const payerID = query.get("PayerID");

    if (orderID && payerID && courseId) {
      console.log("📦 Capturing order:", { orderID, payerID, courseId });

      captureOrder({
        orderID,
        payerID,
        courseId,
        amount: 49.99, // Or pull from backend if dynamic
      });
    }
  }, [location, courseId]);
  return (
    <div className='py-20'>CourseProgress</div>
  )
}

export default CourseProgress