"use client";

import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore } from "@/store/UserStore/useUserStore";
import { toast } from "@/hooks/use-toast";

export default function AuthWithGoogle() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast({
        title: "Success",
        description: "You have successfully signed in with Google.",
      });
      router.push("/dashboard");
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
    <Button
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2"
      aria-label="Sign in with Google"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current" />
      ) : (
        <Image
          src="/google.svg"
          width={24}
          height={24}
          alt=""
          className="shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
    </Button>
  );
}
