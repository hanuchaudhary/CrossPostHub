import { AccountSettings } from "@/components/account/account-settings";
import { ChangePassword } from "@/components/account/change-password";

import { PageLayout } from "../page-layout";

export default function ProfilePage() {
  return (
    <PageLayout centered title="Profile">
      <AccountSettings />
      <ChangePassword />
    </PageLayout>
  );
}
