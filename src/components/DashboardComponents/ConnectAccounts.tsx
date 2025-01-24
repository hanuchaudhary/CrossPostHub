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
import { Loader2, Lock, MoreVertical } from "lucide-react";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStoreStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BottomLoader from "../Loaders/BottomLoader";
import TwitterConnectBTN from "../TwitterConnectButton";
import axios from "axios";

interface SocialApp {
  name: string;
  icon: string;
  provider: string;
}

const socialApps: SocialApp[] = [
  { name: "X", icon: "/twitter.svg", provider: "twitter" },
  { name: "Linkedin", icon: "/linkedin.svg", provider: "linkedin" },
  { name: "Instagram", icon: "/instagram.svg", provider: "instagram" },
  { name: "Threads", icon: "/threads.svg", provider: "threads" },
];

export function ConnectAccounts() {
  const [loading, setLoading] = useState<string | null>(null);
  const [disconnectedAppName, setDisconnectedAppName] = useState<string | null>(
    null
  );
  const { connectedApps, fetchConnectedApps, isFetchingApps } =
    useDashboardStore();

  useEffect(() => {
    fetchConnectedApps();
  }, [fetchConnectedApps]);

  // Connect Logic
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
          description: (
            <div>
              <Badge className="my-2" variant="success">
                Connected
              </Badge>
              <div className="text-sm">
                <p>Your {app.name} account has been successfully connected</p>
                <p>Now you can share your posts on {app.name}</p>
                <span className="text-neutral-500 text-xs">
                  {new Date().toLocaleDateString()}
                </span>
                <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                  CrossPostHub.
                </p>
              </div>
            </div>
          ),
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

  // Disconnect Logic
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const handleDisconnect = async (app: SocialApp) => {
    const connectedApp = connectedApps.find(
      (ca) => ca.provider === app.provider
    );
    if (connectedApp) {
      setDisconnectedAppName(connectedApp.provider!);
      try {
        setIsDisconnecting(true);
        const res = await axios.put("/api/disconnect", {
          provider: connectedApp.provider,
          providerAccountId: connectedApp.providerAccountId,
        });
        if (res.status === 200) {
          toast({
            title: `${app.name} Disconnected`,
            description: (
              <div>
                <Badge className="my-2" variant="destructive">
                  Disconnected
                </Badge>
                <div className="text-xs">
                  <p>
                    Your {app.name} account has been disconnected successfully
                  </p>
                  <p>
                    You can connect your {app.name} account again to share your
                    posts
                  </p>
                  <span className="text-neutral-500 text-xs">
                    {new Date().toLocaleDateString()}
                  </span>
                  <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
                    CrossPostHub.
                  </p>
                </div>
              </div>
            ),
          });
          fetchConnectedApps();
        }
      } catch (error: any) {
        setDisconnectedAppName(null);
        console.error("Disconnect Error:", error);
        toast({
          title: `Error disconnecting from ${app.name}`,
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsDisconnecting(false);
      }
    } else {
      toast({
        title: `Error disconnecting from ${app.name}`,
        description: "Connected app not found",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full relative h-full">
      <Card className="w-full max-w-2xl border-none shadow-none mx-auto">
        <BottomLoader
          isLoading={isDisconnecting}
          selectedPlatforms={[disconnectedAppName!]}
          title={`Disconnecting from ${disconnectedAppName}`}
        />
        <CardHeader className="space-y-0">
          <CardTitle className="text-2xl font-semibold">
            Connect Social Media
          </CardTitle>
          <CardDescription className={""}>
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
                  className="flex relative overflow-hidden items-center justify-between w-full border rounded-xl p-3 hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      height={45}
                      width={45}
                      src={app.icon || "/placeholder.svg"}
                      alt={`${app.name} logo`}
                      className={`transition-all duration-300 ease-in-out ${
                        (app.provider === "twitter" ||
                          app.provider === "threads") &&
                        "dark:invert"
                      }`}
                    />
                    <span className="font-medium">{app.name}</span>
                  </div>
                  {connectedApps.some((ca) => ca.provider === app.provider) ? (
                    <div className="flex items-center space-x-2">
                      <Badge variant="success">Connected</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDisconnect(app)}
                          >
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : app.provider === "twitter" ? (
                    <TwitterConnectBTN />
                  ) : (
                    <Button
                      className="rounded-full"
                      size={"sm"}
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
                  {connectedApps.some((ca) => ca.provider != app.provider) && (
                    <div className="h-full w-full select-none absolute top-0 left-0 bg-secondary/95 md:bg-secondary/70 flex items-center justify-center">
                      <h2 className="font-ClashDisplayMedium md:text-base text-sm">
                        Upgrade to Add More Platforms
                      </h2>
                      <span>
                        <Lock className="h-5 w-5 ml-2" />
                      </span>
                    </div>
                  )}
                </div>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}
