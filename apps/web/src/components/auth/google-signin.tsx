import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FieldSeparator } from "@/components/ui/field";
import { signIn, errorMessage } from "@/lib/api";
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
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={google}
        disabled={pending}
      >
        <Icon name="google" />
        Continue with Google
      </Button>
      <FieldSeparator>or with your email</FieldSeparator>
    </>
  );
}
