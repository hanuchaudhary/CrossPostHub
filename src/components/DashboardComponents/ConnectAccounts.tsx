"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SocialApp {
  name: string;
  icon: string;
  provider: string;
}

const socialApps: SocialApp[] = [
  { name: "X", icon: "/twitter.svg", provider: "twitter" },
  { name: "LinkedIn", icon: "/linkedin.svg", provider: "linkedin" },
  { name: "Instagram", icon: "/instagram.svg", provider: "instagram" },
  { name: "GitHub", icon: "/github.svg", provider: "github" },
];

export function ConnectAccounts() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleConnect = async (app: SocialApp) => {
    setLoading(app.provider);
    try {
      const res = await signIn(app.provider, {
        redirect: false,
      });
      if (res?.error) {
        toast({
          title: `Error connecting to ${app.name}`,
          description: res.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Connected to ${app.name}`,
          description: `Your ${app.name} account has been successfully connected`,
        });
      }
    } catch (error) {
      toast({
        title: `Error connecting to ${app.name}`,
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full border-none shadow-none mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Connect Social Media
        </CardTitle>
        <CardDescription>
          Link your social media accounts to share your posts
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {socialApps.map((app) => (
          <Button
            key={app.provider}
            variant="outline"
            className="w-full justify-start text-left h-auto py-4 px-4 hover:bg-secondary/80 transition-colors"
            onClick={() => handleConnect(app)}
            disabled={loading === app.provider}
          >
            <div className="flex items-center space-x-4">
              <div className="relative w-8 h-8">
                <Image
                  src={app.icon || "/placeholder.svg"}
                  alt={`${app.name} logo`}
                  layout="fill"
                  objectFit="contain"
                  className="transition-all duration-300 ease-in-out"
                />
              </div>
              <span className="flex-grow">Connect to {app.name}</span>
              {loading === app.provider && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
