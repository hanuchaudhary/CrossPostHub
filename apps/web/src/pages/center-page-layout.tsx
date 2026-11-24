import type React from "react";

import { cn } from "cn";

import { PageHeading } from "@/components/workspace/common";

export const CenterPageLayout = ({
  children,
  description,
  title,
  classname,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  classname?: string;
}) => {
  return (
    <div className={cn(classname, "max-w-2xl mx-auto pb-20 pt-4 md:pt-6")}>
      <PageHeading title={title} description={description} />
      <div>{children}</div>
    </div>
  );
};
