import { Link } from "react-router";

import { SiteRule } from "../corners";
import { Button } from "../ui/button";
import { Iphone } from "../ui/iphone";
import { DepthFlipHeading } from "./depth-flip-heading";
import { MarqueeHero } from "./hero-marquee";
import { SocialArc } from "./social-arc";

export function Hero() {
  return (
    <section className="overflow-hidden relative">
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative  min-h-[calc(100vh-4rem)] overflow-hidden px-6 py-16 md:h-[calc(100vh-4rem)] md:p-10">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <div className="flex items-center h-full pb-22 relative z-20">
          <div className="space-y-7">
            <h1 className="heading">
              Create once.
              <span className="flex gap-2">
                <span>Share</span>
                <DepthFlipHeading />
              </span>
            </h1>
            <p className="subheading max-w-md!">
              Write, schedule, and publish your posts across platforms from one
              place. Spend less time switching tabs and more time creating.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-10 px-4"
                nativeButton={false}
                render={<Link to="/register" />}
              >
                Register
              </Button>
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<a href="#how-it-works" />}
              >
                How it works
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-50 left-25 mask-l-from-80%">
          <MarqueeHero />
        </div>
        <div className="absolute -bottom-30 right-0 z-10 w-60 opacity-30 md:right-45 md:w-90 md:opacity-100">
          <Iphone className="relative">
            <SocialArc />
            <div className="dark:h-100 h-90 absolute bg-primary-foreground rounded-full scale-130 w-full dark:-bottom-20 bottom-0 blur-2xl"></div>
            <div className="dark:h-100 h-90 absolute bg-primary-foreground rounded-full scale-130 w-full dark:-bottom-20 bottom-0 blur-2xl"></div>
            <div className="dark:h-100 h-90 absolute bg-primary-foreground rounded-full scale-130 w-full dark:-bottom-20 bottom-0 blur-2xl"></div>
          </Iphone>
        </div>
      </div>
    </section>
  );
}
