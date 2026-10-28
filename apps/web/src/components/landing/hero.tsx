import { Link } from "react-router";

import { SiteRule } from "../corners";
import { Button } from "../ui/button";
import { Iphone } from "../ui/iphone";
import { MarqueeHero } from "./hero-marquee";

export function Hero() {
  return (
    <section className="overflow-hidden relative">
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative  h-[calc(100vh-4rem)] overflow-hidden p-10">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <div className="space-y-7">
          <h1 className="text-4xl eading-[1.06] tracking-tighter">
            Create once.
            <br />
            Connect
            <br />
            <span className="text-muted-foreground">everywhere.</span>
          </h1>
          <p className="max-w-sm text-sm leading-7 text-muted-foreground">
            Your voice, on every platform. Write, plan, and publish your social
            posts from one happy little place.
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
        <div className="absolute -bottom-50">
          <MarqueeHero />
        </div>
        <div className="absolute -bottom-30 right-60 z-20 w-90">
          <Iphone className="">
            <div className="h-30 absolute bg-background/90 w-full bottom-35"></div>
          </Iphone>
        </div>
      </div>
    </section>
  );
}
