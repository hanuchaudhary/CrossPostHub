import { AccountSettings } from "@/components/account/account-settings";
import { ChangePassword } from "@/components/account/change-password";

import { CenterPageLayout } from "../center-page-layout";

export default function ProfilePage() {
  return (
    <CenterPageLayout title="Profile">
      <AccountSettings />
      <ChangePassword />
    </CenterPageLayout>
  );
}
