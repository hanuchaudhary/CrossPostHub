import { Link } from "react-router";

import { SiteCorners, SiteRule } from "@/components/corners";
import { authClient } from "@/lib/auth-client";

import { Brand } from "../ui/brand";
import { Button } from "../ui/button";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
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
            <div className="flex items-center gap-14">
              <Brand />

              <nav aria-label="Primary" className="max-lg:hidden">
                <ul className="flex items-center gap-2" role="list">
                  {[
                    ["Features", "/#features"],
                    ["Channels", "/#channels"],
                    ["Pricing", "/pricing"],
                  ].map(([label, href]) => (
                    <Link
                      className="subheading text-sm! text-primary! hover:underline"
                      to={href}
                      key={href}
                    >
                      {label}
                    </Link>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {session?.user ? (
                <Button
                  variant="primary"
                  nativeButton={false}
                  render={<Link to="/dashboard" />}
                >
                  Dashboard
                </Button>
              ) : !isPending ? (
                <>
                  <Button
                    variant="ghost"
                    nativeButton={false}
                    render={<Link to="/signin" />}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant={"primary"}
                    nativeButton={false}
                    render={<Link to="/register" />}
                  >
                    Get started
                  </Button>
                </>
              ) : (
                <span role="status" className="text-sm text-muted-foreground">
                  <span className="sr-only">Checking your session</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
