"use client";

import { useEffect, useState } from "react";
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
import { MoreVertical } from "lucide-react";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TwitterConnectBTN from "../TwitterConnectButton";
import { IconLoader, IconLockFilled } from "@tabler/icons-react";
import { Disconnect } from "./Disconnect";

export interface SocialApp {
  name: string;
  icon: string;
  provider: string;
}

const socialApps: SocialApp[] = [
  { name: "X", icon: "/twitter.svg", provider: "twitter" },
  { name: "Linkedin", icon: "/linkedin.svg", provider: "linkedin" },
  { name: "Instagram", icon: "/instagram2.svg", provider: "instagram" },
  { name: "Threads", icon: "/threads.svg", provider: "threads" },
];

export function ConnectAccounts() {
  const [loading, setLoading] = useState<string | null>(null);
  const { connectedApps, fetchConnectedApps, isFetchingApps } =
    useDashboardStore();

  useEffect(() => {
    fetchConnectedApps();
  }, [fetchConnectedApps]);

  const handleConnect = async (app: SocialApp) => {
    setLoading(app.provider);
    try {
      const res = await signIn(app.provider, { redirect: false });
      if (res?.error) {
        toast({
          title: `Error connecting to ${app.name}`,
          description: res.error,
          variant: "destructive",
        });
      } else if (res?.ok) {
        toast({
          title: `🎉 Connected to ${app.name}`,
          description: `Your ${app.name} account has been successfully connected!`,
        });
        await fetchConnectedApps();
      }
    } catch {
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
    <div className="w-full relative h-full">
      <Card className="w-full max-w-2xl z-20 relative bg-transparent border-none shadow-none mx-auto">
        <CardHeader className="space-y-0">
          <CardTitle className="md:text-2xl text-xl font-ClashDisplayMedium tracking-wide">
            Connect Social Media
          </CardTitle>
          <CardDescription className="md:text-base text-xs">
            Link your social media accounts to share your posts
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isFetchingApps
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-16 rounded-xl" />
              ))
            : socialApps.map((app) => (
                <div
                  key={app.provider}
                  className="flex relative items-center overflow-hidden justify-between w-full border rounded-xl p-3 hover:bg-secondary/80 transition-colors"
                >
                  {(app.provider === "instagram" ||
                    app.provider === "threads") && (
                    <div className="absolute inset-0 bg-secondary/95 flex items-center justify-center z-10">
                      <h2 className="font-ClashDisplayMedium md:text-base text-sm">
                        Coming Soon...
                      </h2>
                      <IconLockFilled className="h-5 w-5 ml-2" />
                    </div>
                  )}
                  <div className="flex items-center space-x-4">
                    <Image
                      height={45}
                      width={45}
                      src={app.icon}
                      alt={`${app.name} logo`}
                      className={`${
                        app.provider === "twitter" || app.provider === "threads"
                          ? "dark:invert-[1]"
                          : ""
                      }`}
                    />
                    <span className="font-medium">{app.name}</span>
                  </div>
                  {connectedApps.some((ca) => ca.provider === app.provider) ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Badge variant="success">Connected</Badge>
                      <Disconnect app={app} />
                    </div>
                  ) : app.provider === "twitter" ? (
                    <TwitterConnectBTN />
                  ) : (
                    <Button
                      className="rounded-full"
                      size="sm"
                      onClick={() => handleConnect(app)}
                      disabled={loading === app.provider}
                    >
                      {loading === app.provider ? (
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  )}
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
