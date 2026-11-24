import { Button } from "@/components/ui/button";
import { errorMessage, signIn } from "@/lib/api";

import { SiteRule } from "../corners";

export function GoogleSignin({
  pending,
  onPendingChange,
  onError,
  callbackPath = "/dashboard",
}: {
  pending: boolean;
  onPendingChange: (pending: boolean) => void;
  onError: (error: string) => void;
  callbackPath?: string;
}) {
  async function google() {
    onPendingChange(true);
    onError("");
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: `${location.origin}${callbackPath}`,
      });
      if (result.error) throw new Error(result.error.message);
    } catch (error) {
      onError(errorMessage(error));
    } finally {
      onPendingChange(false);
    }
  }
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full h-14"
        onClick={google}
        disabled={pending}
      >
        <img src="/icons/google-icon.svg" className="size-5" />
        Continue with Google
      </Button>
      <div>
        <SiteRule className="-bottom-5" />
        <span className="absolute text-muted-foreground text-sm -bottom-7 left-1/2 -translate-x-1/2">or with your email</span>
      </div>
    </div>
  );
}
