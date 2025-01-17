"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { NavProfileLoader } from "../Loaders/NavProfileLoader";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

export const UserProfile: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const user = {
    displayName: "Kush Chaudhary",
    email: "kushchaudharu0g@gmail.com",
    photoURL: "",
  } 

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return <NavProfileLoader />;
  }

  if (!user) {
    return <div>No user logged in</div>;
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <div className="flex gap-1 select-none items-center md:dark:bg-secondary/30 md:bg-secondary md:border dark:border-secondary/40 md:px-2 md:py-1 md:rounded-lg ">
              <Avatar>
                <AvatarImage src={user.photoURL || ""}></AvatarImage>
                <AvatarFallback className="uppercase">
                  {(user.displayName && user.displayName[0]) || "CH"}
                </AvatarFallback>
              </Avatar>
              <div className="md:block hidden">
                <p className="text-base font-ClashDisplayMedium leading-none">
                  {user.displayName || "Cross Post Hub"}
                </p>
                <p className="text-xs dark:text-neutral-300 text-neutral-600">
                  {user.email || "kushchaudharyog@gmail.com"}
                </p>
              </div>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>
              <Button onClick={handleSignOut} className="mt-4">
                Sign Out
              </Button>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
