import type React from "react";

import { cn } from "cn";

import { PageHeading } from "@/components/workspace/common";

export const PageLayout = ({
  children,
  title,
  description,
  actions,
  centered = false,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  centered?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        centered && "mx-auto max-w-3xl pb-20 pt-4 md:pt-6",
        className
      )}
    >
      {(title || description || actions) && (
        <PageHeading title={title} description={description}>
          {actions}
        </PageHeading>
      )}
      {children}
    </div>
  );
};
