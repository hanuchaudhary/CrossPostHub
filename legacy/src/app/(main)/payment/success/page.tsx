import PageLoader from "@/components/Loaders/PageLoader";
import PaymentSuccessPage from "@/components/PaymentComponents/PaymentSuccesPage";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentSuccessPage />
    </Suspense>
  );
}
