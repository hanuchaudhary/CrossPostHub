"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStoreStore";
import { Twitter, Linkedin, Github, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export function ConnectedApps() {
  const { fetchConnectedApps, connectedApps } = useDashboardStore();

  useEffect(() => {
    fetchConnectedApps();
  }, [fetchConnectedApps]);

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-lg leading-none">Connected Apps</CardTitle>
        <CardDescription className="text-xs leading-none">
          Manage your connected applications and services
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {connectedApps.map((app) => (
          <div
            key={app.id_token}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
                <Image
                  src={`/${app.provider}.svg` || "/placeholder.svg"}
                  alt={app.provider!}
                  width={40}
                  height={40}
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    app.provider === "X" && "dark:invert"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">
                  {app.provider}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-500 text-green-900">Connected</Badge>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options for {app.provider}</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
