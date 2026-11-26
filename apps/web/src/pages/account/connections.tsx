import { ConnectedAccounts } from "@/components/post/connected-accounts";
import { CreatePostButton } from "@/components/posts/composer";

import { PageLayout } from "../page-layout";

export default function ConnectionsPage() {
  return (
    <PageLayout
      centered
      title="Social Accounts"
      description="Connect the Instagram, LinkedIn and X accounts your posts publish to."
      actions={<CreatePostButton />}
    >
      <ConnectedAccounts />
    </PageLayout>
  );
}
