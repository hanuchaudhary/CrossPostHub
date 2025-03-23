"use client";

import {
  ArrowUp,
  Calendar,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative w-full mt-40 bg-background/80 border  backdrop-blur-sm shadow-2xl rounded-t-3xl py-16 px-4 md:px-8">
      <div className="">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <h2 className="font-ClashDisplaySemibold text-2xl leading-none text-emerald-500">
              CrossPostHub.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground dark:text-neutral-400">
              Create, Schedule, Share – All in One Place
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-primary-foreground px-4 py-3 rounded-xl border">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">
                Next Release
              </p>
              <p className="text-xs text-muted-foreground">
                April 2025
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full bg-border border-dashed h-px my-3"></div>

        {/* Bottom section with socials and copyright */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 md:mb-0">
            <p className="text-sm text-muted-foreground dark:text-neutral-400">
              © 2025 CrossPostHub. All rights reserved.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="absolute right-8 top-36 flex items-center justify-center w-14 h-14 rounded-lg bg-primary-foreground border border-border hover:bg-muted transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-7 w-7 dark:text-neutral-400" />
          </button>
        </div>

        {/* Build in public credit */}
        <div className="mt-8 text-xs md:text-sm text-muted-foreground dark:text-neutral-500 flex items-center justify-between">
          <p>
            Build in public by{" "}
            <a
              href="https://x.com/KushChaudharyOg"
              className="text-blue-400 font-ClashDisplayMedium underline"
              target="_blank"
              rel="noreferrer"
            >
              @KushChaudharyOg
            </a>
          </p>
          <div className="flex space-x-4 md:ml-8">
            <span className="font-ClashDisplayMedium">
              Connect:
            </span>
            {[
              { href: "https://github.com/hanuchaudhary", name: "GitHub" },
              { href: "https://x.com/KushChaudharyOg", name: "Twitter" },
              { href: "#", name: "LinkedIn" },
              { href: "#", name: "Instagram" },
              { href: "#", name: "YouTube" },
              { href: "#", name: "Facebook" },
            ].map((social) => (
              <Link
                href={social.href}
                target="_blank"
                className="text-muted-foreground dark:text-neutral-400 hover:text-primary dark:hover:text-white transition-colors"
              >
                <span>
                  {social.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
