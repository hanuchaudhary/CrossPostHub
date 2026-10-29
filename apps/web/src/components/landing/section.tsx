import type { ReactNode } from "react";

import { cn } from "cn";

import { SiteCorners, SiteRule } from "../corners";

export function LandingSection({
  children,
  id,
  classname,
}: {
  children: ReactNode;
  id?: string;
  classname?: string;
}) {
  return (
    <section id={id} className="relative scroll-mt-16">
      <SiteRule className="bottom-0" />
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24",
          classname
        )}
      >
        <SiteCorners />
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        {children}
      </div>
    </section>
  );
}
