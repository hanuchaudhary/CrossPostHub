
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      `?client_id=${import.meta.env.VITE_THREADS_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(`${import.meta.env.VITE_API_URL}/api/auth/threads/callback`)}` +
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
