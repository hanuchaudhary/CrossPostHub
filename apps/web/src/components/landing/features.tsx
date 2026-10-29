import { type ReactNode, useState } from "react";

import { motion, useReducedMotion } from "motion/react";

import { FrameBox } from "../corners";
import { Icon } from "../ui/icon";
import "./features.css";
import { Reveal } from "./reveal";
import { LandingSection } from "./section";

const channels = ["twitter", "linkedin", "instagram"];
const channelNames = ["X", "LinkedIn", "Instagram"];

function ChannelIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <img
      src={`/icons/${name}-icon.svg`}
      alt=""
      className={`size-5 object-contain ${name === "twitter" || name === "threads" ? "invert dark:invert-0" : ""} ${className}`}
    />
  );
}

function Diagram({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`feature-diagram relative flex min-h-64 items-center justify-center overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function Copy({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 space-y-3 px-6 pb-7 md:px-8 md:pb-8">
      <p className="text-[10px] tracking-[.16em] text-muted-foreground">
        {number}
      </p>
      <h3 className="text-xl font-light tracking-tight">{title}</h3>
      <p className="max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function PublishingFlow() {
  const reduced = useReducedMotion();
  return (
    <Diagram
      label="One draft flows through CrossPostHub to X, LinkedIn, and Instagram"
      className="min-h-80 md:min-h-96"
    >
      <div className="absolute inset-0 feature-flow-grid" />
      <svg
        viewBox="0 0 960 340"
        className="absolute inset-0 h-full w-full text-muted-foreground/35"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          d="M310 170H620 M620 170Q660 170 660 90H730 M620 170H730 M620 170Q660 170 660 250H730"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 5"
        />
        {!reduced &&
          [
            "M310 170H730",
            "M310 170H620Q660 170 660 90H730",
            "M310 170H620Q660 170 660 250H730",
          ].map((path, i) => (
            <circle key={path} r="3" fill="#60baff">
              <animateMotion
                path={path}
                dur="3.8s"
                begin={`${i * 0.7}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
      </svg>
      <motion.div
        className="absolute left-[7%] w-[36%] max-w-72 border bg-background p-4 shadow-sm md:left-[10%] md:p-5"
        initial={false}
        whileInView={reduced ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mb-4 flex items-center gap-2 border-b pb-3">
          <span className="size-5 rounded-full bg-muted" />
          <span className="text-[10px] text-muted-foreground">
            Your next idea
          </span>
          <span className="ml-auto size-1 rounded-full bg-sky-400" />
        </div>
        <p className="text-xs font-light leading-relaxed sm:text-sm">
          Good ideas deserve
          <br />
          more than one audience.
        </p>
        <div className="my-4 flex h-16 items-center justify-center overflow-hidden border bg-muted/30 sm:h-20">
          <div className="feature-art-mark" />
        </div>
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>One draft. Every destination.</span>
          <Icon name="send" size={12} />
        </div>
      </motion.div>
      <FrameBox className="absolute left-1/2 flex size-14 -translate-x-1/2 items-center justify-center bg-background shadow-sm md:size-20">
        <img src="/logo.svg" alt="" className="size-7 md:size-9" />
      </FrameBox>
      <div className="absolute right-[7%] flex w-[26%] max-w-48 flex-col gap-4 md:right-[9%]">
        {channels.map((channel, i) => (
          <motion.div
            key={channel}
            className="flex items-center gap-2.5 border bg-background px-3 py-3 sm:px-4"
            initial={false}
            whileInView={reduced ? {} : { opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 4, delay: i * 0.6, repeat: Infinity }}
          >
            <ChannelIcon name={channel} />
            <span className="text-[10px] sm:text-xs">{channelNames[i]}</span>
            <span className="ml-auto text-sky-500">
              <Icon name="check" size={12} />
            </span>
          </motion.div>
        ))}
      </div>
    </Diagram>
  );
}

function ScheduleIllustration() {
  const [day, setDay] = useState(2);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className="feature-diagram relative flex min-h-72 flex-col justify-center px-6 py-8 md:px-10">
      <div className="relative border bg-background p-4 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs tracking-tight">
            A little room to create.
          </span>
          <Icon name="calendar" size={16} />
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {days.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={day === i}
              aria-label={`Preview ${label}'s schedule`}
              onClick={() => setDay(i)}
              className={`flex min-h-16 flex-col items-center justify-center gap-2 border text-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${day === i ? "border-foreground/40 bg-muted" : "border-transparent text-muted-foreground hover:bg-muted/50"}`}
            >
              <span>{label}</span>
              <span className="text-base font-light">{12 + i}</span>
              <span
                className={`size-1 rounded-full ${day === i ? "bg-sky-400" : "bg-muted-foreground/30"}`}
              />
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <ChannelIcon name={channels[day % 3]} />
          <span className="text-[10px] text-muted-foreground">
            {days[day]} · 10:00 AM
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[9px]">
            <span className="size-1 rounded-full bg-sky-400" />
            Scheduled
          </span>
        </div>
      </div>
      <span className="mt-4 text-center font-mono text-[9px] tracking-wide text-muted-foreground">
        YOUR IDEAS, ON YOUR TIME.
      </span>
    </div>
  );
}

function MediaIllustration() {
  return (
    <Diagram
      label="Images and words come together in a single social post"
      className="min-h-72"
    >
      <div className="relative h-48 w-72 max-w-[85%]">
        <div className="absolute left-3 top-5 h-36 w-32 -rotate-12 border bg-background p-2 shadow-sm">
          <div className="feature-art-landscape h-full w-full" />
        </div>
        <div className="absolute right-3 top-2 h-40 w-40 rotate-6 border bg-background p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo.svg" alt="" className="size-4" />
            <span className="text-[9px] text-muted-foreground">
              Made to be shared
            </span>
          </div>
          <div className="feature-art-mark mx-auto h-16 w-16" />
          <div className="mt-3 h-1 w-full bg-muted" />
          <div className="mt-2 h-1 w-3/4 bg-muted" />
          <div className="mt-3 flex gap-1.5">
            {channels.map((name) => (
              <ChannelIcon key={name} name={name} className="size-3!" />
            ))}
          </div>
        </div>
        <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap border bg-background px-3 py-2 text-[9px] text-muted-foreground">
          <Icon name="image" size={12} />A picture. A story. One post.
        </span>
      </div>
    </Diagram>
  );
}

function WorkspaceIllustration() {
  return (
    <Diagram
      label="A dashboard keeps published, scheduled, and pending posts together"
      className="min-h-72"
    >
      <div className="w-[85%] max-w-sm border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-[11px]">Your publishing space</span>
          <span className="font-mono text-[9px] text-muted-foreground">
            THIS WEEK
          </span>
        </div>
        {[
          {
            channel: "linkedin",
            title: "Something worth sharing",
            status: "Published",
            tone: "bg-emerald-400",
          },
          {
            channel: "twitter",
            title: "The next chapter starts here",
            status: "Scheduled",
            tone: "bg-sky-400",
          },
          {
            channel: "instagram",
            title: "A moment behind the scenes",
            status: "Pending",
            tone: "bg-amber-400",
          },
        ].map((row) => (
          <div
            key={row.channel}
            className="flex items-center gap-3 border-b px-4 py-4 last:border-0"
          >
            <ChannelIcon name={row.channel} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px]">{row.title}</p>
              <div className="mt-2 h-1 w-2/3 bg-muted" />
            </div>
            <span className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
              <span className={`size-1 rounded-full ${row.tone}`} />
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </Diagram>
  );
}

export function Features() {
  return (
    <LandingSection id="features">
      <Reveal className="mb-14 space-y-7 text-center">
        <h2 className="heading mx-auto">
          More creating.
          <br />
          <span className="text-muted-foreground">Less juggling.</span>
        </h2>
        <p className="subheading max-w-lg! mx-auto">
          From the first spark to the final post.
          <br />A little less friction, a lot more flow.
        </p>
      </Reveal>
      <div className="space-y-6">
        <FrameBox className="feature-card bg-background border">
          <PublishingFlow />
          <div className="grid gap-7 md:grid-cols-2">
            <Copy
              number="01 / CROSS-POSTING"
              title="One idea. More places to land."
            >
              Write your post once, choose your connected channels, and send
              your story out into the world.
            </Copy>
            <Copy
              number="02 / YOUR WORKFLOW"
              title="Keep your focus on the good part."
            >
              Bring your words, visuals, and publishing together. Give every
              idea a home without the tab hopping.
            </Copy>
          </div>
        </FrameBox>
        <div className="grid grid-cols-2 gap-6">
          <FrameBox className="feature-card h-full bg-background border">
            <ScheduleIllustration />
            <Copy number="03 / SCHEDULING" title="Make time work for you.">
              Post in the moment or choose a future date. Make space for your
              next idea while this one finds its audience.
            </Copy>
          </FrameBox>
          <FrameBox className="feature-card h-full bg-background border">
            <MediaIllustration />
            <Copy
              number="04 / WORDS + VISUALS"
              title="Give your story a little more life."
            >
              Upload your images and pair them with the right words. Keep the
              whole story together, from draft to destination.
            </Copy>
          </FrameBox>
        </div>
        <FrameBox className="feature-card grid bg-background md:grid-cols-2 border">
          <WorkspaceIllustration />
          <div className="flex items-center pt-3 md:pt-8">
            <Copy
              number="05 / YOUR WORKSPACE"
              title="A home for everything you share."
            >
              Published, scheduled, or still making its way. See where every
              post stands, with a calmer view of your content.
            </Copy>
          </div>
        </FrameBox>
      </div>
    </LandingSection>
  );
}
