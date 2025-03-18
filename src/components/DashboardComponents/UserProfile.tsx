"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { NavProfileLoader } from "../Loaders/NavProfileLoader";
import { signOut, useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const UserProfile: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/signin",
      });
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!session) {
    return <NavProfileLoader />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex gap-1 select-none items-center md:dark:bg-secondary/30 md:bg-secondary md:border dark:border-secondary/40 md:px-2 md:py-1 md:rounded-lg ">
            <Avatar>
              <AvatarImage src={session.user.image || ""}/>
              <AvatarFallback className="uppercase font-semibold font-ClashDisplayMedium">
                {session?.user.name ? session.user.name[0] : "CH"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base text-start font-ClashDisplayMedium leading-none">
                {session.user.name || session.user.name || "Cross Post Hub"}
              </p>
              <p className="text-xs dark:text-neutral-300 text-neutral-600">
                {session.user.email || "kushchaudharyog@gmail.com"}
              </p>
            </div>
          </div>
          <TooltipContent>Profile</TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
