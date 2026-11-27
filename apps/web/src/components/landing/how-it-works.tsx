import type { ComponentType } from "react";

import {
  CalendarClock,
  Link,
  SquarePen,
  type IconProps,
} from "@keyline-icons/react/duotone";

import { LandingSection } from "./section";

const steps: {
  n: string;
  icon: ComponentType<IconProps>;
  title: string;
  text: string;
}[] = [
  {
    n: "01",
    icon: Link,
    title: "Connect your accounts.",
    text: "Link X, LinkedIn, Instagram, Threads, Bluesky and more. Each one takes a single sign-in.",
  },
  {
    n: "02",
    icon: SquarePen,
    title: "Write it once.",
    text: "Add your words and media, then tune the caption for each platform if you want to.",
  },
  {
    n: "03",
    icon: CalendarClock,
    title: "Post now or later.",
    text: "Publish right away or pick a time. CrossPostHub sends it out and tells you how it went.",
  },
];

export function HowItWorks() {
  return (
    <LandingSection id="how-it-works">
      <div className="mb-14 space-y-7">
        <h2 className="heading">
          From idea to post.
          <br />
          <span className="text-muted-foreground">In three small steps.</span>
        </h2>
        <p className="subheading max-w-md!">
          No tab-switching, no copy and paste. Just one place for the whole
          journey.
        </p>
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.n}
            className="rounded-2xl bg-popover p-1 ring-1 ring-foreground/10"
          >
            <div className="flex h-full flex-col gap-10 rounded-xl bg-secondary p-5 shadow ring-2 ring-muted">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-background">
                  <step.icon className="size-6" aria-hidden="true" />
                </span>
                <span className="text-3xl font-light tabular-nums tracking-tighter text-muted-foreground/50">
                  {step.n}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium txt">{step.title}</h3>
                <p className="text-sm text-muted-foreground txt">
                  {step.text}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}
