import { BillingDetails } from "@/components/account/billing-details";

import { PageLayout } from "../page-layout";

export default function BillingPage() {
  return (
    <PageLayout centered
      title="Billing"
      description="Review your plan and subscription."
    >
      <BillingDetails />
    </PageLayout>
  );
}
