import { useState } from "react";
import { Link } from "react-router";

import { Separator } from "@base-ui/react";

import { SiteRule } from "../corners";
import { Brand } from "../ui/brand";

export const Footer = () => {
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer className="">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 relative">
        <SiteRule orientation="y" className="left-0" />
        <SiteRule orientation="y" className="right-0" />
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
        </div>
      </div>
    </footer>
  );
};
