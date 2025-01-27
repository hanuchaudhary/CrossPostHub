import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function PricingCardLoader() {
  return (
    <div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
