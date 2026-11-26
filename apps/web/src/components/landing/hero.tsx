import type { ReactNode } from "react";
import { Link } from "react-router";

import { motion, useReducedMotion } from "motion/react";

import { SiteRule } from "../corners";
import { Button } from "../ui/button";
import { Iphone } from "../ui/iphone";
import { DepthFlipHeading } from "./depth-flip-heading";
import { MarqueeHero } from "./hero-marquee";
import { SocialArc } from "./social-arc";

function BlurIn({
  children,
  delay = 0,
  y = 16,
  duration = 0.8,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="overflow-hidden relative">
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative  min-h-[calc(100vh-4rem)] overflow-hidden px-6 py-16 md:h-[calc(100vh-4rem)] md:p-10">
        <SiteRule className="left-0" orientation="y" />
        <SiteRule className="right-0" orientation="y" />
        <div className="flex items-center h-full md:pb-22 relative z-20 mt-20 md:mt-0">
          <div className="md:space-y-7 space-y-5">
            <BlurIn>
              <h1 className="heading md:text-5xl!">
                Create once.
                <span className="flex gap-2">
                  <span>Share</span>
                  <DepthFlipHeading />
                </span>
              </h1>
            </BlurIn>
            <BlurIn delay={0.15}>
              <p className="subheading max-w-md!">
                Write, schedule, and publish your posts across platforms from
                one place. Spend less time switching tabs and more time
                creating.
              </p>
            </BlurIn>
            <BlurIn
              delay={0.3}
              className="flex flex-wrap items-center gap-3 mt-10 md:mt-0"
            >
              <Button
                variant={"primary"}
                nativeButton={false}
                render={<Link to="/register" />}
              >
                Register
              </Button>
              <Button
                variant="secondary"
                nativeButton={false}
                render={<a href="#features" />}
              >
                Explore features
              </Button>
            </BlurIn>
          </div>
        </div>
        <div className="absolute md:-bottom-50 -bottom-95 md:left-25 mask-l-from-80% md:scale-100 scale-150">
          <BlurIn delay={0.5} y={0} duration={1.1}>
            <MarqueeHero />
          </BlurIn>
        </div>
        <div className="absolute -bottom-30 md:left-auto md:translate-x-0 left-1/2 -translate-x-1/2 z-10 w-60 md:right-45 md:w-90 md:opacity-100">
          <BlurIn delay={0.2} y={96} duration={1.1}>
            <Iphone className="relative">
              <SocialArc />
              <div className="dark:h-100 md:h-90 h-40 absolute bg-primary-foreground rounded-full scale-130 w-full dark:-bottom-20 bottom-0 blur-2xl"></div>
              <div className="dark:h-100 md:h-90 h-40 absolute bg-primary-foreground rounded-full scale-130 w-full dark:-bottom-20 bottom-0 blur-2xl"></div>
              <div className="dark:h-100 md:h-90 h-40 absolute bg-primary-foreground rounded-full scale-130 w-full dark:-bottom-20 bottom-0 blur-2xl"></div>
            </Iphone>
          </BlurIn>
        </div>
      </div>
    </section>
  );
}
