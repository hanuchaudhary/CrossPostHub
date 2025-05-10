"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function ThreadsConnectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    setIsLoading(true);
    const state = Math.random().toString(36).substring(2, 8);
    const scopes = [
      "threads_basic",
      "threads_content_publish",
      "threads_manage_replies",
      "threads_manage_insights",
    ].join(",");

    const authUrl =
      "https://threads.net/oauth/authorize" +
      `?client_id=${process.env.NEXT_PUBLIC_THREADS_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/threads/callback`)}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(scopes)}`;

    window.location.href = authUrl;
  };

  return (
    <Button
      className="rounded-full"
      size={"sm"}
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        "Connect"
      )}
    </Button>
  );
}
