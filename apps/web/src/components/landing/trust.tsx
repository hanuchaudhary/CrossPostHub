import type { ComponentType } from "react";

import {
  BadgeCheck,
  Bell,
  Lock,
  Unlink,
  type IconProps,
} from "@keyline-icons/react/duotone";

import { LandingSection } from "./section";
import { TrustDemo } from "./trust-demo";

const points: {
  icon: ComponentType<IconProps>;
  title: string;
  text: string;
}[] = [
  {
    icon: Lock,
    title: "Tokens stay locked",
    text: "Platform access is encrypted with AES-256-GCM before it's stored, and we never see your passwords.",
  },
  {
    icon: BadgeCheck,
    title: "You own your posts",
    text: "Your words and media stay yours. We only send them where you ask, when you ask.",
  },
  {
    icon: Unlink,
    title: "Leave any time",
    text: "Disconnect a platform in one click and we delete its access. No lock-in, no ads, no selling data.",
  },
  {
    icon: Bell,
    title: "Nothing goes missing",
    text: "Every post shows whether it's scheduled, sent or needs a hand, so you always know where it stands.",
  },
];

export function Trust() {
  return (
    <LandingSection id="trust" containerClassname="bg-secondary/20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-7">
          <h2 className="heading">
            Your accounts.
            <br />
            <span className="text-muted-foreground">Kept in good hands.</span>
          </h2>
          <p className="subheading max-w-sm!">
            Connecting your socials is a big ask. Here's how we look after
            them.
          </p>
        </div>
        <div className="min-w-0">
          <TrustDemo />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {points.map((point) => (
              <li key={point.title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary">
                  <point.icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium txt">
                    {point.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground txt">
                    {point.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </LandingSection>
  );
}
