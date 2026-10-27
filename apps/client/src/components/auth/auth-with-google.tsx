import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
 
import { toast } from "sonner";
import { authClient } from "@/lib/auth.client";
import { Loader2 } from "lucide-react";

export default function AuthWithGoogle() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user && !isLoading) {
      navigate("/dashboard");
    }
  }, [session, isLoading, navigate]);

  const handleGoogleSignIn = async () => {
    if (isLoading || isPending || session?.user) return;
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (result?.error) {
        toast.error("Google sign-in failed", { description: result.error.message });
      }
    } catch (error) {
      toast.error("Google sign-in failed", {
        description: "An error occurred while signing in with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading || isPending || Boolean(session?.user)}
      className="w-full rounded-full border py-3 flex items-center justify-center gap-1 dark:border-neutral-600"
      aria-label="Sign in with Google"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin rounded-full" />
      ) : (
        <img
          src="/google.svg"
          width={32}
          height={32}
          alt=""
          className="shrink-0"
          aria-hidden="true"
        />
      )}
      <span className="font-light">
        {isLoading ? "Signing in..." : "Continue with Google"}
      </span>
    </button>
  );
}
