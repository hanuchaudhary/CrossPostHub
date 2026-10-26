"use client";

import React from "react";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import {
  IconFileDownloadFilled,
  IconLockFilled,
  IconSend,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";

interface Props {
  handleShareWithCrosspostHub: () => void;
  store: any;
}

export default function UpperToolbar({
  handleShareWithCrosspostHub,
  store,
}: Props) {
  const { data } = useSession();

  return (
    <div className="md:flex hidden fixed top-2 right-3 border rounded-2xl p-1 gap-2 bg-secondary/50">
      <Button
        size={"sm"}
        className="w-full flex items-center justify-center gap-1"
        onClick={() => {
          store.saveDraft();
          toast({
            title: "Draft Saved",
          });
        }}
      >
        <IconFileDownloadFilled /> Save as Draft
      </Button>

      <Button
        size={"sm"}
        variant={"secondary"}
        className="w-full flex items-center justify-center gap-2"
        onClick={() => {
          store.loadDraft();
          toast({
            title: "Your saved draft has been loaded.",
          });
        }}
      >
        Load Draft
      </Button>

      <Button
        size={"sm"}
        className="w-full"
        onClick={handleShareWithCrosspostHub}
      >
        {!data?.user.name ? (
          <span className=" flex items-center justify-center gap-1">
            Share <IconLockFilled />
          </span>
        ) : (
          <span className=" flex items-center justify-center gap-1">
            Share <IconSend />
          </span>
        )}
      </Button>
    </div>
  );
}
