import { PLATFORM_RULES, PLATFORMS } from "@repo/shared/platforms";

import { getChannel } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { LandingSection } from "./section";

function mediaLine(platform: (typeof PLATFORMS)[number]) {
  const rules = PLATFORM_RULES[platform];
  const photos = rules.imageTypes.length > 0;
  const videos = rules.videoTypes.length > 0;
  const files = `${rules.maxMedia} ${rules.maxMedia === 1 ? "file" : "files"}`;
  if (rules.requiresMedia === "video") return "One video";
  if (rules.requiresMedia === "image") return "One photo";
  if (photos && videos) return `Up to ${files}, photos or video`;
  if (photos) return `Up to ${rules.maxMedia} photos`;
  return "Text only";
}

export function Platforms() {
  return (
    <LandingSection id="platforms">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-7">
          <h2 className="heading">
            Every channel.
            <br />
            <span className="text-muted-foreground">Its own rules, handled.</span>
          </h2>
          <p className="subheading max-w-md!">
            Each platform counts characters and media differently. The composer
            checks them for you before anything goes out.
          </p>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {PLATFORMS.length} platforms
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        {PLATFORMS.map((platform) => {
          const channel = getChannel(platform);
          const rules = PLATFORM_RULES[platform];
          return (
            <li
              key={platform}
              className="rounded-2xl bg-secondary/50 p-1"
            >
              <div className="flex flex-col items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-secondary dark:bg-background/60">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary">
                  {channel && (
                    <img
                      src={channel.icon}
                      alt=""
                      className={cn("size-6", channel.iconClassName)}
                    />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium txt">{rules.name}</p>
                  <p className="mt-2 text-xl font-light tabular-nums tracking-tight md:text-2xl">
                    {rules.text.toLocaleString()}
                    <span className="ml-1 text-xs text-muted-foreground">
                      characters
                    </span>
                  </p>
                </div>
              </div>
              <p className="px-3 py-2 text-xs text-muted-foreground text-pretty">
                {mediaLine(platform)}
              </p>
            </li>
          );
        })}
      </ul>
    </LandingSection>
  );
}
