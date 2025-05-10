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
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TwitterConnectBTN from "../Buttons/TwitterConnectButton";
import { IconLoader, IconLockFilled } from "@tabler/icons-react";
import { Disconnect } from "./Disconnect";
import { motion, AnimatePresence } from "motion/react";
import ThreadsConnectButton from "../Buttons/ThreadsConnectButton";
import { useLatestSubscription } from "@/hooks/useLatestSubscription";

export interface SocialApp {
  name: string;
  icon: string;
  provider: string;
}

const socialApps: SocialApp[] = [
  { name: "X", icon: "/twitter.svg", provider: "twitter" },
  { name: "Linkedin", icon: "/linkedin.svg", provider: "linkedin" },
  { name: "Threads", icon: "/threads.svg", provider: "threads" },
  { name: "Instagram", icon: "/instagram.svg", provider: "instagram" },
];

export function ConnectAccounts() {
  const [loading, setLoading] = useState<string | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);
  const { connectedApps, fetchConnectedApps, isFetchingApps } =
    useDashboardStore();

  const { subscriptionStatus, loading: subscriptionLoading } =
    useLatestSubscription();

  let isPremium = false;
  if (!subscriptionLoading) {
    isPremium = subscriptionStatus === "active";
  }

  useEffect(() => {
    fetchConnectedApps();
  }, [fetchConnectedApps]);

  const handleConnect = async (app: SocialApp) => {
    if (!isPremium && connectedApps.length >= 2) {
      toast({
        title: "Limit Reached",
        description:
          "Free users can connect only 2 platforms. Upgrade to premium to connect more.",
        variant: "destructive",
      });
      return;
    }

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
            : socialApps.map((app) => {
                const isConnected = connectedApps.some(
                  (ca) => ca.provider === app.provider
                );
                const disableConnect =
                  !isConnected && !isPremium && connectedApps.length >= 2;

                return (
                  <div
                    key={app.provider}
                    className="flex relative items-center overflow-hidden justify-between w-full border rounded-xl p-3 hover:bg-secondary/80 transition-colors"
                    onMouseEnter={() => setHoveredApp(app.provider)}
                    onMouseLeave={() => setHoveredApp(null)}
                  >
                    {
                      // TODO: LOCK INSTGRAM AFTER TESTING
                    }
                    {app.provider === "" && (
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
                          app.provider === "twitter" ||
                          app.provider === "threads"
                            ? "dark:invert-[1]"
                            : ""
                        }`}
                      />
                      <span className="font-medium">{app.name}</span>
                    </div>
                    {isConnected ? (
                      <div className="flex items-center justify-center space-x-2">
                        <AnimatePresence mode="wait">
                          {hoveredApp !== app.provider ? (
                            <motion.div
                              className="cursor-pointer"
                              key="badge"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge variant="success">Connected</Badge>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="disconnect"
                              className="cursor-pointer"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Disconnect app={app} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : app.provider === "twitter" ? (
                      <TwitterConnectBTN disabled={disableConnect} />
                    ) : app.provider === "threads" ? (
                      <ThreadsConnectButton />
                    ) : (
                      <Button
                        className="rounded-full"
                        size="sm"
                        onClick={() => handleConnect(app)}
                        disabled={loading === app.provider || disableConnect}
                      >
                        {loading === app.provider ? (
                          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
        </CardContent>
      </Card>
    </div>
  );
}
