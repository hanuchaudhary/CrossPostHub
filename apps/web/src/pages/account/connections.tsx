import { ConnectedAccounts } from "@/components/post/connected-accounts";
import { useComposer } from "@/components/posts/composer";
import { Button } from "@/components/ui/button";

export default function ConnectionsPage() {
  const openComposer = useComposer();
  return (
    <div className="w-full pt-10 pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading">Social accounts</h1>
          <p className="mt-1 subheading">
            Connect the Instagram, LinkedIn and X accounts your posts publish
            to.
          </p>
        </div>
        <Button size="pill" variant="brand" onClick={() => openComposer()}>
          Create a post
        </Button>
      </div>
      <ConnectedAccounts />
    </div>
  );
}
