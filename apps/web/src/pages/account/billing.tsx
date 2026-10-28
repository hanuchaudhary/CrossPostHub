import { BillingDetails } from "@/components/account/billing-details";

import { CenterPageLayout } from "../center-page-layout";

export default function BillingPage() {
  return (
    <CenterPageLayout
      title="Billing"
      description="Review your plan and subscription."
    >
      <BillingDetails />
    </CenterPageLayout>
  );
}
