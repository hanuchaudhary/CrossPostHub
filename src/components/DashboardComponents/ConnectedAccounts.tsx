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
import { Twitter, Linkedin, Github, MoreHorizontal } from "lucide-react";
import Image from "next/image";

export function ConnectedApps() {
  const connectedApps = [
    {
      name: "X",
      icon: "/twitter.svg",
      connectedDate: "Connected on Apr 23, 2023",
    },
    {
      name: "LinkedIn",
      icon: "/linkedin.svg",
      connectedDate: "Connected on May 5, 2023",
    },
    {
      name: "GitHub",
      icon: "/github.svg",
      connectedDate: "Connected on Jun 12, 2023",
    },
    {
      name: "Instagram",
      icon: "/instagram.svg",
      connectedDate: "Connected on Jun 12, 2023",
    },
  ];

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="text-lg leading-none">Connected Apps</CardTitle>
        <CardDescription className="text-xs leading-none">
          Manage your connected applications and services
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {connectedApps.map((platform) => (
          <div
            key={platform.name}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800">
                <Image
                  src={platform.icon || "/placeholder.svg"}
                  alt={platform.name}
                  width={40}
                  height={40}
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    platform.name === "X" && "dark:invert"
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">
                  {platform.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {platform.connectedDate}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Connected</Badge>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">
                  More options for {platform.name}
                </span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
