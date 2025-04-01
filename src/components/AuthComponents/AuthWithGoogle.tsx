"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function AuthWithGoogle() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && !isLoading) {
      toast({
        title: "Success",
        description: "You have successfully signed in with Google.",
      });
      router.push("/dashboard");
    }
  }, [status, isLoading, router]);

  const handleGoogleSignIn = async () => {
    if (isLoading || status === "authenticated") return;
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Error",
        description: "An error occurred while signing in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading || status === "authenticated"}
      className="w-full rounded-full border py-3 flex items-center justify-center gap-1 dark:border-neutral-600"
      aria-label="Sign in with Google"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin rounded-full" />
      ) : (
        <Image
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
