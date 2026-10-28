import { useState } from "react";
import { Link } from "react-router";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import Feature from "@/components/ui/block-feature";
import { Pricing } from "@/components/landing/pricing";
import { Icon } from "@/components/ui/icon";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
export default function Landing() {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <section className="border-y bg-muted/30 px-5 py-7">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
            <p className="text-center text-[9px] tracking-widest text-muted-foreground">
              A LITTLE LESS TAB-SWITCHING. A LOT MORE YOU.
            </p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-16">
              {(["twitter", "linkedin", "instagram"] as const).map(
                (platform) => (
                  <div
                    key={platform}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Icon name={platform} size={23} />
                    {platform === "twitter"
                      ? "X / Twitter"
                      : platform === "linkedin"
                        ? "LinkedIn"
                        : "Instagram"}
                    {platform === "instagram" && (
                      <Badge
                        variant="outline"
                        className="hidden sm:inline-flex"
                      >
                        Coming soon
                      </Badge>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mb-10 space-y-4 text-center">
            <Badge variant="outline">FROM “WHAT IF” TO “IT’S LIVE”</Badge>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Good ideas travel light.
            </h2>
            <p className="text-sm text-muted-foreground">
              Three little steps between you and your next great post.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: "link" as const,
                title: "Bring your people together.",
                text: "Connect your accounts. Give your ideas a home across your favorite platforms.",
              },
              {
                n: "02",
                icon: "sparkle" as const,
                title: "Make something worth sharing.",
                text: "Write your story, add your visuals, and make every post feel like you.",
              },
              {
                n: "03",
                icon: "send" as const,
                title: "Send it out. Or sleep on it.",
                text: "Publish in the moment or pick the right time. Your calendar has it covered.",
              },
            ].map((step) => (
              <section className="flex min-w-0 flex-col gap-4" key={step.n}>
                <header className="flex flex-col gap-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                      <Icon name={step.icon} />
                    </div>
                    <span className="text-xl font-medium tracking-tight text-muted-foreground/40">
                      {step.n}
                    </span>
                  </div>
                  <h2 className="text-sm font-medium">{step.title}</h2>
                </header>
                <div className="min-w-0">
                  <p className="text-xs leading-6 text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </section>
        <Feature />
        <Pricing />
        <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-24">
          <section className="flex min-w-0 flex-col gap-4 bg-muted/40 py-12 text-center">
            <header className="flex flex-col gap-4">
              <Badge variant="outline" className="mx-auto">
                YOUR NEXT CHAPTER STARTS WITH ONE POST.
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                The world is waiting
                <br />
                for your kind of creative.
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Give your ideas a little more room to grow.
              </p>
            </header>
            <div className="min-w-0 space-y-3">
              <Button
                nativeButton={false}
                size="lg"
                className="h-10 px-4"
                render={<Link to="/register" />}
              >
                Let’s make something <Icon name="arrow" />
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Free to start. Easy to love.
              </p>
            </div>
          </section>
        </section>
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <div className="grid grid-cols-3 gap-x-4 gap-y-10 pb-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
            <div className="col-span-3 space-y-4 sm:col-span-1">
              <Brand />
              <p className="text-xs leading-6 text-muted-foreground">
                One idea. Every platform.
                <br />A little more time for what you love.
              </p>
            </div>
            {[
              {
                title: "Explore",
                links: [
                  ["Features", "/#features"],
                  ["How it works", "/#how-it-works"],
                  ["Pricing", "/#pricing"],
                ],
              },
              {
                title: "Your space",
                links: [
                  ["Sign in", "/signin"],
                  ["Create an account", "/register"],
                  ["Dashboard", "/dashboard"],
                ],
              },
              {
                title: "The small print",
                links: [
                  ["Privacy policy", "/privacy"],
                  ["Terms of service", "/terms"],
                  ["Get in touch", "/contact"],
                ],
              },
            ].map((group) => (
              <div key={group.title} className="space-y-4">
                <h3 className="text-xs font-medium">{group.title}</h3>
                <ul className="space-y-3">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        to={href}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-5 pt-6">
            <p className="text-[10px] text-muted-foreground">
              © {year} CrossPostHub. Made for your next idea.
            </p>
            <div className="flex gap-4">
              <Icon name="twitter" size={16} />
              <Icon name="linkedin" size={16} />
              <Icon name="instagram" size={16} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
