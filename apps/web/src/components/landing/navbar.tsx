import { Link } from "react-router";

import { SiteCorners, SiteRule } from "@/components/corners";

import { Button } from "../ui/button";
import { Brand } from "../ui/brand";

export function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-40 bg-background backdrop-blur-sm">
        <SiteRule className="bottom-0 z-20" />
        <SiteRule className="top-0 z-20" />
        <div className="relative isolate mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 lg:px-8">
          <SiteRule className="left-0 z-20" orientation="y" />
          <SiteRule className="right-0 z-20" orientation="y" />
          <SiteCorners />
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                aria-label="Homepage"
                className="flex shrink-0 items-center gap-2.5 text-foreground"
                to="/"
              >
                <Brand />
              </Link>

              <nav aria-label="Primary" className="max-lg:hidden">
                <ul className="flex items-center gap-1" role="list">
                  {[["Features", "#features"], ["How it works", "#how-it-works"], ["Pricing", "#pricing"]].map(([label, href]) => (
                    <li key={href}>
                      <Button variant="ghost" nativeButton={false} render={<a href={href} />}>{label}</Button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="lg" nativeButton={false} render={<Link to="/signin" />}>Sign in</Button>
              <Button size="lg" nativeButton={false} render={<Link to="/register" />}>Get started</Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
