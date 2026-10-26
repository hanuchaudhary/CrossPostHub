import { MorphingText } from "../ui/morphing_text";
import { authClient } from "@/lib/auth.client";

export default function PageLoader({ loading }: { loading?: boolean }) {
  const { isPending } = authClient.useSession();
  return (
    <>
      {loading ||
        (isPending && (
          <div className="h-screen bg-black/40 backdrop-blur-sm z-[9999] fixed top-0 left-0 w-full flex items-center justify-center">
            <MorphingText
              texts={["CrossPostHub.", "Share", "Quick", "Edit", "Schedule"]}
            />
          </div>
        ))}
    </>
  );
}
