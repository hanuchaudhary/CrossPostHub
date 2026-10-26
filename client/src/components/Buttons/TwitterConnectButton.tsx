
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";

export default function TwitterConnectButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.linkSocial({ provider: "twitter", callbackURL: `${window.location.origin}/dashboard` });
      if (result.error) throw new Error(result.error.message);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        disabled={disabled || isLoading}
        className="rounded-full"
        size={"sm"}
        onClick={handleLogin}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Connect"
        )}
      </Button>
    </div>
  );
}
