import React from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

type PricingCardLoaderProps = {
  classname ?: string;
};

export default function PricingCardLoader({ classname }: PricingCardLoaderProps) {
  return (
    <div>
      <Skeleton
        className={cn(
          classname,
          "max-w-[65rem] relative mx-auto lg:px-0 px-3 pb-5 rounded-2xl h-96"
        )}
      />
    </div>
  );
}
