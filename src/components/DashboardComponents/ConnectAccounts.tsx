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
import { Loader2, MoreVertical } from "lucide-react";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStoreStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialApp {
  name: string;
  icon: string;
  provider: string;
}

const socialApps: SocialApp[] = [
  { name: "X", icon: "/twitter.svg", provider: "twitter" },
  { name: "LinkedIn", icon: "/linkedin.svg", provider: "linkedin" },
  { name: "Instagram", icon: "/instagram.svg", provider: "instagram" },
  { name: "threads", icon: "/threads.svg", provider: "threads" },
];

export function ConnectAccounts() {
  const [loading, setLoading] = useState<string | null>(null);
  const { connectedApps, fetchConnectedApps, isFetchingApps } =
    useDashboardStore();

  useEffect(() => {
    fetchConnectedApps();
  }, []);

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
      } else {
        toast({
          title: `Connected to ${app.name}`,
          description: `Your ${app.name} account has been successfully connected`,
        });
        await fetchConnectedApps();
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

  const handleDisconnect = async (app: SocialApp) => {
    toast({
      title: `Disconnected from ${app.name}`,
      description: `Your ${app.name} account has been successfully disconnected`,
    });
    await fetchConnectedApps();
  };

  return (
    <Card className="w-full max-w-2xl border-none shadow-none mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Connect Social Media
        </CardTitle>
        <CardDescription>
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
                className="flex items-center justify-between w-full border rounded-xl p-4 hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Image
                    height={40}
                    width={40}
                    src={app.icon || "/placeholder.svg"}
                    alt={`${app.name} logo`}
                    className="transition-all duration-300 ease-in-out"
                  />
                  <span className="font-medium">{app.name}</span>
                </div>
                {connectedApps
                  .map((ca) => ca.provider)
                  .includes(app.provider) ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">Connected</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDisconnect(app)}>
                          Disconnect
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(app)}
                    disabled={loading === app.provider}
                  >
                    {loading === app.provider ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
