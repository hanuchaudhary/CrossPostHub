"use client";

import React from "react";
import { MorphingText } from "../ui/morphing-text";
import { useSession } from "next-auth/react";

export default function PageLoader({ loading }: { loading?: boolean }) {
  const { status } = useSession();
  return (
    <>
      {loading ||
        (status === "loading" && (
          <div className="h-screen bg-black/40 backdrop-blur-sm z-[9999] fixed top-0 left-0 w-full flex items-center justify-center">
            <MorphingText
              texts={["CrossPostHub.", "Share", "Quick", "Edit", "Schedule"]}
            />
          </div>
        ))}
    </>
  );
}
