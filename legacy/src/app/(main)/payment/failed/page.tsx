import PageLoader from "@/components/Loaders/PageLoader";
import PaymentFailedPage from "@/components/PaymentComponents/PaymentFailedPage";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentFailedPage />
    </Suspense>
  );
}
