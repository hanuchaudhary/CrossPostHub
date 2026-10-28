import { useState } from "react";
import { Link } from "react-router";

import { Separator } from "@base-ui/react";

import { SiteRule } from "../corners";
import GradientASCII from "../GradientASCII";
import { ThemeSwitch } from "../theme-switch";
import { Brand } from "../ui/brand";

export const Footer = () => {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer className="relative isolate overflow-hidden min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[65vh] md:h-[95vh]"
        aria-hidden="true"
      >
        <GradientASCII
          className="h-full w-full opacity-70 mask-[linear-gradient(to_right,transparent,black_85%)] rotate-180"
          colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
          shape="horizon"
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
        />
      </div>
        <SiteRule orientation="y" className="left-0" />
        <SiteRule orientation="y" className="right-0" />
        <div className="grid grid-cols-3 gap-x-4 gap-y-10 pb-10 sm:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-3 space-y-4 sm:col-span-1">
            <Brand />
            <p className="subheading">
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
            <div key={group.title} className="space-y-4 subheading">
              <h3 className="text-base">{group.title}</h3>
              <ul className="space-y-1">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="text-base transition-colors duration-200 hover:text-blue-300 hover:underline text-primary"
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
          <p className="subheading text-sm! text-muted-foreground">
            © {year} CrossPostHub. Made for your next idea.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Appearance</span>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </footer>
  );
};
