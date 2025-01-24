"use client";

import * as React from "react";
import { X, Twitter, Linkedin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDashboardStore } from "@/store/DashboardStore/useDashboardStoreStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function ConnectedPlatforms() {
  const { fetchAccountDetails, twitterUserDetails } = useDashboardStore();

  // React.useEffect(() => {
    // if (!twitterUserDetails) fetchAccountDetails();
  // }, [fetchAccountDetails, twitterUserDetails]);

  // Dummy LinkedIn profile data
  const linkedInProfile = {
    name: "John Doe",
    headline: "Software Engineer at Tech Co.",
    profileImageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    connections: 500,
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Connected Platforms</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-ClashDisplayRegular text-2xl mb-2">
            Connected Platforms
          </DrawerTitle>
          <DrawerDescription>
            Your connected platforms and their details.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          {twitterUserDetails && (
            <div className="bg-secondary/80 rounded-2xl p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={twitterUserDetails.profile_image_url_https}
                  />
                  <AvatarFallback>{twitterUserDetails.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-ClashDisplayRegular text-xl leading-none mb-1">
                    {twitterUserDetails.name}
                  </h3>
                  <p className="text-muted-foreground">
                    @{twitterUserDetails.screen_name}
                  </p>
                </div>
                <Image
                className="dark:invert"
                src={"/twitter.svg"}
                alt={"twitter"}
                width={64}
                height={64}
              />
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {twitterUserDetails.followers_count}
                  </p>
                  <p className="text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="font-medium">
                    {twitterUserDetails.friends_count}
                  </p>
                  <p className="text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-secondary/80 rounded-2xl p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={linkedInProfile.profileImageUrl} />
                <AvatarFallback>{linkedInProfile.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-ClashDisplayRegular text-xl leading-none mb-1">
                  {linkedInProfile.name}
                </h3>
                <p className="text-muted-foreground">
                  {linkedInProfile.headline}
                </p>
              </div>
              <Image
                src={"/linkedin.svg"}
                alt={"linkedin"}
                width={64}
                height={64}
              />
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{linkedInProfile.connections}</p>
                <p className="text-muted-foreground">Connections</p>
              </div>
            </div>
          </div>
        </div>
        <DrawerClose className="absolute top-2 right-2">
          <Button variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
