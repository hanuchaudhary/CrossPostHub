import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { motion, useReducedMotion } from "motion/react";

import { SiteRule } from "../corners";
import PixelBlast from "../PixelBlast";
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

function usePhoneCutout() {
  const layer = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const [mask, setMask] = useState<string>();
  useEffect(() => {
    const measure = () => {
      const l = layer.current;
      const p = phone.current;
      if (!l || !p || !l.offsetWidth) return;
      const box = l.getBoundingClientRect();
      const scale = box.width / l.offsetWidth;
      const ph = p.getBoundingClientRect();
      const local = (value: number, origin: number) => (value - origin) / scale;
      const top = local(ph.top + ph.width * 0.22, box.top);
      const height = (ph.width * 1) / scale;
      const left = local(ph.left, box.left);
      const right = local(ph.right, box.left);
      const outer = 28 / scale;
      const inner = 16 / scale;
      const w = l.offsetWidth;
      const h = l.offsetHeight;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><filter id="f"><feGaussianBlur stdDeviation="${6 / scale}"/></filter><mask id="m"><rect width="100%" height="100%" fill="white"/><g filter="url(#f)" fill="black"><rect x="${left - outer}" y="${top}" width="${outer + inner}" height="${height}"/><rect x="${right - inner}" y="${top}" width="${outer + inner}" height="${height}"/></g></mask></defs><rect width="100%" height="100%" fill="white" mask="url(#m)"/></svg>`;
      setMask(`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (layer.current) observer.observe(layer.current);
    if (phone.current) observer.observe(phone.current);
    window.addEventListener("resize", measure);
    const settle = window.setTimeout(measure, 1400);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(settle);
    };
  }, []);
  return { layer, phone, mask };
}

export function Hero() {
  const cutout = usePhoneCutout();
  return (
    <section className="overflow-hidden relative">
      <SiteRule className="bottom-0" />
      <div className="max-w-6xl mx-auto relative  min-h-[calc(100vh-4rem)] overflow-hidden px-6 py-16 md:h-[calc(100vh-4rem)] md:p-10">
        <div className="absolute w-full inset-0 opacity-80">
          <PixelBlast
            variant="square"
            pixelSize={2}
            color="#71717A"
            patternScale={2.6}
            patternDensity={1.1}
            softness={0.6}
            glow={0.3}
            twinkle={0.25}
            drift={0.2}
            hoverEffect="grow"
            enableRipples
            edgeFade={0.25}
            accentColor="#56BBF5"
            pixelSizeJitter={0}
            smoothing={1}
            speed={0.5}
            driftAngle={30}
            hoverRadius={140}
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            autoRipple={0}
            tiltX={0}
            tiltY={0}
            intro={false}
            lightMode={false}
          />
        </div>
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
              <p className="subheading text-primary! max-w-md!">
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
        <div className="absolute inset-0 mask-x-from-85%">
          <div className="@container absolute -bottom-40 left-1/2 aspect-[433/882] w-60 -translate-x-1/2 md:left-auto md:right-45 md:w-90 md:translate-x-0">
            <BlurIn
              delay={0.5}
              y={0}
              duration={1.1}
              className="absolute top-[0.46cqw] left-[-580.65cqw] aspect-[3996/570] w-[1288.15cqw]"
            >
              <div
                className="size-full"
                ref={cutout.layer}
                style={
                  cutout.mask
                    ? {
                        maskImage: cutout.mask,
                        WebkitMaskImage: cutout.mask,
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%",
                      }
                    : undefined
                }
              >
                <MarqueeHero />
              </div>
            </BlurIn>
          </div>
        </div>
        <div
          ref={cutout.phone}
          className="absolute -bottom-30 md:left-auto md:translate-x-0 left-1/2 -translate-x-1/2 z-10 w-60 md:right-45 md:w-90 md:opacity-100"
        >
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
