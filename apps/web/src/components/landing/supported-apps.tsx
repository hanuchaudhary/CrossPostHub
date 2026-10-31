import { cn } from "cn";

import { FrameBox } from "../corners";
import { Reveal } from "./reveal";
import { LandingSection } from "./section";

const apps = [
  { id: "twitter", name: "Twitter" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
  { id: "threads", name: "Threads" },
  { id: "bluesky", name: "Bluesky" },
  { id: "facebook", name: "Facebook" },
  { id: "pinterest", name: "Pinterest" },
  { id: "tiktok", name: "TikTok" },
];

export function SupportedApps() {
  return (
    <LandingSection id="channels" classname="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <Reveal className="mb-12 space-y-6 text-center">
        <h2 className="heading mx-auto">
          Your favorite channels.
          <br />
          <span className="text-muted-foreground">
            A single place to create.
          </span>
        </h2>
        <p className="mx-auto subheading ">
          Publish to X, LinkedIn, and Instagram. More places for your ideas are
          on the way.
        </p>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 border w-full divide-x divide-y">
        {apps.map((app, index) => (
          <FrameBox
            key={app.id}
            tone="frame"
            corners={index < 4 ? ["bl", "br"] : []}
            className={cn(
              `group flex min-h-24 flex-col items-center justify-center gap-3 px-3 py-7 transition-colors hover:bg-muted/30`,
              index % 2 === 0 && "bg-muted/15",
              index > 3 && "md:border-b-0",
            )}
          >
            <div className="flex items-center gap-3">
              <img
                src={`/icons/${app.id}-icon.svg`}
                alt=""
                className={cn(
                  `size-6 object-contain grayscale transition-all group-hover:grayscale-0 md:size-7`,
                  ["twitter", "threads"].includes(app.id) &&
                    "invert dark:invert-0"
                )}
              />
              <span className="text-base font-medium tracking-tight md:text-lg">
                {app.name}
              </span>
            </div>
          </FrameBox>
        ))}
      </div>
    </LandingSection>
  );
}
