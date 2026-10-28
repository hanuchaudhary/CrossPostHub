import { type ReactNode, useState } from "react";
import { Link } from "react-router";

import { SiteCorners, SiteRule } from "@/components/corners";
import GradientASCII from "@/components/GradientASCII";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function AuthLayout({
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const [year] = useState(() => new Date().getFullYear());

  return (
    <div className="flex min-h-svh flex-col overflow-x-clip bg-background">
      <header className="relative">
        <SiteRule className="top-0" />
        <SiteRule className="bottom-0" />
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6 md:px-10">
          <SiteRule className="left-0" orientation="y" />
          <SiteRule className="right-0" orientation="y" />
          <SiteCorners />
          <Brand />
          <Button variant="ghost" nativeButton={false} render={<Link to="/" />}>
            <Icon name="back" />
            Back home
          </Button>
        </div>
      </header>

      <main className="relative mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-2">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />

        <section className="relative isolate hidden min-w-0 flex-col justify-center gap-10 overflow-hidden p-10 lg:flex">
          <SiteRule className="right-0" orientation="y" />
          <div className="space-y-6">
            <h2 className="heading">
              One space.
              <br />
              Endless possibilities.
            </h2>
            <p className="subheading max-w-sm!">
              Let your ideas do the traveling.
              <br />
              You’ve got better things to create.
            </p>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[65vh] md:h-[95vh]"
            aria-hidden="true"
          >
            <GradientASCII
              className="h-full w-full opacity-70 mask-[linear-gradient(to_right,transparent,black_85%)]"
              colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}

              shape="pinch"
              characters=" =+xX0S8#@"
              cellSize={18}
              density={0.8}
              glyphOpacity={0.85}
              glow={0.2}
              depthOfField={0}
              flicker={0.2}
              softness={0.5}
              scale={1}
              flow={0.5}
              speed={1}
              gradientOpacity={0.9}
              grain={0.08}
              variation={0}
              mouseInteraction
              scrambleRadius={0.1}
              clickEffect="wave"
              intro
              // lightMode={theme === "light"}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Made for the beautifully busy creator.
          </p>
        </section>

        <section
          aria-labelledby="auth-title"
          className="flex min-w-0 items-center justify-center px-6 py-12 md:px-10 md:py-16"
        >
          <div className="w-full max-w-md p-6 sm:p-8">
            <div className="min-w-0 space-y-6">{children}</div>
            <div className="mt-6 text-center text-xs leading-6 text-muted-foreground">
              {footer}
            </div>
            <div className="relative mt-6 pt-5">
              <p className="text-center text-[10px] leading-5 text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link className="underline underline-offset-4" to="/terms">
                  Terms
                </Link>{" "}
                and{" "}
                <Link className="underline underline-offset-4" to="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative">
        <SiteRule className="top-0" />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-5 text-center md:px-10">
          <SiteRule className="left-0" orientation="y" />
          <SiteRule className="right-0" orientation="y" />
          <SiteCorners corners={["tl", "tr"]} />
          <p className="text-[10px] text-muted-foreground">
            © {year} CrossPostHub
          </p>
        </div>
      </footer>
    </div>
  );
}
