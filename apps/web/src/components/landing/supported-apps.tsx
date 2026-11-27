import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "cn";
import { useAnimate, useReducedMotion } from "motion/react";

import { LandingSection } from "./section";

const apps = [
  { id: "twitter", name: "X(twitter)" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "threads", name: "Threads" },
  { id: "bluesky", name: "Bluesky" },
  { id: "facebook", name: "Facebook" },
  { id: "pinterest", name: "Pinterest" },
  { id: "tiktok", name: "TikTok" },
  { id: "mastodon", name: "Mastodon" },
  { id: "telegram", name: "Telegram" },
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function LogoTrack() {
  const [order, setOrder] = useState(apps);
  const [scope, animate] = useAnimate<HTMLUListElement>();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        await wait(1500);
        const track = scope.current;
        const first = track?.firstElementChild as HTMLElement | null;
        if (cancelled || !track || !first) return;
        await animate(
          track,
          { x: -first.offsetWidth },
          { duration: 0.9, ease: [0.65, 0, 0.35, 1] }
        );
        if (cancelled) return;
        flushSync(() =>
          setOrder((current) => [...current.slice(1), current[0]!])
        );
        animate(track, { x: 0 }, { duration: 0 });
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [animate, reduced, scope]);

  return (
    <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)]">
      <ul ref={scope} className="flex w-max">
        {order.map((app) => (
          <li
            key={app.id}
            className="flex w-40 shrink-0 items-center justify-center gap-2.5 md:w-48"
          >
            <img
              src={`/icons/${app.id}-icon.svg`}
              alt=""
              className={cn(
                "size-6 object-contain opacity-70 md:size-7",
                ["twitter", "threads"].includes(app.id) &&
                  "invert dark:invert-0"
              )}
            />
            <span className="text-lg font-medium tracking-tight whitespace-nowrap text-muted-foreground md:text-xl">
              {app.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SupportedApps() {
  return (
    <LandingSection id="channels">
      <div className="flex flex-col gap-8 py-6 md:flex-row md:items-center md:gap-12">
        <p className="shrink-0 text-base leading-snug font-normal text-muted-foreground md:w-60">
          Publish to the channels
          <br />
          your audience already uses
        </p>
        <span className="sr-only">
          {apps.map((app) => app.name).join(", ")}
        </span>
        <div aria-hidden="true" className="flex min-w-0 flex-1">
          <LogoTrack />
        </div>
      </div>
    </LandingSection>
  );
}
