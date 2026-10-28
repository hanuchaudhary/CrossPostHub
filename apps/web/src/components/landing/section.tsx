import type { ReactNode } from "react";

import { SiteRule } from "../corners";

/** Shared rails, content width, and gutters established by the hero. */
export function LandingSection({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section id={id} className="relative scroll-mt-16">
      <SiteRule className="bottom-0" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        {children}
      </div>
    </section>
  );
}
