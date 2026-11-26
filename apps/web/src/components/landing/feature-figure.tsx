import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Comment01Icon,
  FavouriteIcon,
  Image01Icon,
  RepeatIcon,
  Tick02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "cn";

import { Icon } from "@/components/ui/icon";
import type { Platform } from "@/lib/types";

type FigureKind = "publish" | "workflow" | "schedule" | "media" | "workspace";

type Beat = { ms: number; target: string; press?: boolean; drag?: boolean };

type SceneProps = { step: number };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useInView<T extends Element>(ref: RefObject<T | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(!!entry?.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function useLoop(
  beats: Beat[],
  playing: boolean,
  reduced: boolean,
  poster: number
) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setStep((current) => (current + 1) % beats.length),
      beats[step]!.ms
    );
    return () => window.clearTimeout(timer);
  }, [beats, playing, step]);
  return reduced ? poster : step;
}

function Pointer() {
  return (
    <svg height="24" width="24" viewBox="0 0 32 32" fill="none">
      <g transform="translate(10 7)">
        <path
          d="m6.148 18.473 1.863-1.003 1.615-.839-2.568-4.816h4.332l-11.379-11.408v16.015l3.316-3.221z"
          fill="#fff"
        />
        <path
          d="m6.431 17 1.765-.941-2.775-5.202h3.604l-8.025-8.043v11.188l2.53-2.442z"
          fill="#000"
        />
      </g>
    </svg>
  );
}

function Cursor({
  figure,
  beat,
  hidden,
  carry,
}: {
  figure: RefObject<HTMLDivElement | null>;
  beat: Beat;
  hidden: boolean;
  carry?: ReactNode;
}) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const root = figure.current;
    if (!root) return;
    const measure = () => {
      const target = root.querySelector<HTMLElement>(
        `[data-target="${beat.target}"]`
      );
      if (!target) return;
      const box = root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPoint({
        x: rect.left - box.left + rect.width / 2,
        y: rect.top - box.top + rect.height / 2,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [beat.target, figure]);
  if (!point || hidden) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 z-30 transition-transform duration-700 ease-[cubic-bezier(0.45,0,0.2,1)]"
      style={{ transform: `translate(${point.x}px, ${point.y}px)` }}
    >
      {carry && (
        <div
          className={cn(
            "absolute top-3 left-3 transition-all duration-300",
            beat.drag ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
        >
          {carry}
        </div>
      )}
      <div
        className={cn(
          "absolute -top-[5.25px] -left-[7.5px] origin-[7.5px_5.25px] drop-shadow-[0_1px_1px_rgb(0_0_0/0.25)] transition-transform duration-150",
          beat.press && "scale-90"
        )}
      >
        <Pointer />
      </div>
    </div>
  );
}

function Glyph({
  icon,
  size = 16,
  className,
  style,
}: {
  icon: IconSvgElement;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={1.8}
      style={style}
      className={cn("shrink-0", className)}
    />
  );
}

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute top-10 right-5 left-5 flex h-[308px] flex-col overflow-hidden rounded-2xl bg-background shadow-[0_1px_2px_rgb(0_0_0/0.04),0_16px_40px_-16px_rgb(0_0_0/0.18)] ring-1 ring-foreground/10 [mask-image:linear-gradient(to_bottom,#000_68%,transparent)] sm:right-10 sm:left-10 dark:shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}

function Bar({ className }: { className?: string }) {
  return <span className={cn("block h-2 rounded-full bg-muted", className)} />;
}

function Filler({ rows = 2 }: { rows?: number }) {
  const widths = ["w-1/2", "w-2/5", "w-3/5", "w-1/3"];
  return (
    <ul className="space-y-1 px-2">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center gap-3 px-2 py-2">
          <span className="size-10 shrink-0 rounded-lg bg-muted" />
          <span className="flex-1 space-y-2">
            <Bar className={widths[index % widths.length]} />
            <Bar className={widths[(index + 2) % widths.length]} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function Rest() {
  return (
    <span
      data-target="rest"
      className="absolute right-[18%] bottom-6 size-px"
    />
  );
}

const CHANNELS: { id: Platform; name: string }[] = [
  { id: "twitter", name: "X" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "instagram", name: "Instagram" },
];

const PUBLISH: Beat[] = [
  { ms: 900, target: "rest" },
  { ms: 750, target: "chip-twitter" },
  { ms: 260, target: "chip-twitter", press: true },
  { ms: 650, target: "chip-linkedin" },
  { ms: 260, target: "chip-linkedin", press: true },
  { ms: 650, target: "chip-instagram" },
  { ms: 260, target: "chip-instagram", press: true },
  { ms: 800, target: "post" },
  { ms: 260, target: "post", press: true },
  { ms: 2200, target: "post" },
  { ms: 900, target: "rest" },
];

function Publish({ step }: SceneProps) {
  const picked = [step >= 3, step >= 5, step >= 7].map((on) => on && step < 10);
  const count = picked.filter(Boolean).length;
  const posted = step === 9;
  return (
    <Panel>
      <div className="flex items-center gap-2 border-b px-3 py-3 sm:px-4">
        <span className="mr-1 hidden text-xs whitespace-nowrap text-muted-foreground sm:inline">
          Post to
        </span>
        {CHANNELS.map((channel, index) => (
          <span
            key={channel.id}
            data-target={`chip-${channel.id}`}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs whitespace-nowrap ring-1 transition-[background-color,color,box-shadow] duration-300",
              picked[index]
                ? "bg-brand/10 text-foreground ring-brand/50"
                : "bg-secondary text-muted-foreground ring-border"
            )}
          >
            <Icon name={channel.id} size={14} />
            {channel.name}
          </span>
        ))}
      </div>
      <div className="space-y-3 px-4 pt-4">
        <p className="text-[15px] leading-snug">
          Our spring collection drops Friday. Here’s a first look at the colors.
        </p>
        <span className="block text-xs text-muted-foreground tabular-nums">
          68 / 280
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <span className="flex items-center gap-3 text-muted-foreground">
          <Glyph icon={Image01Icon} />
          <Glyph icon={Video01Icon} />
        </span>
        <span
          data-target="post"
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-sm whitespace-nowrap transition-[background-color,color,opacity] duration-300",
            posted
              ? "bg-emerald-600 text-white dark:bg-emerald-500"
              : "bg-linear-to-b from-[#60c5f8] to-[#0072e5] text-white shadow-[inset_0_1px_0_#ffffffb3,inset_0_0_0_1px_#ffffff26,0_2px_3px_#0072e526]",
            count === 0 && !posted && "opacity-50"
          )}
        >
          {posted && <Glyph icon={Tick02Icon} />}
          {posted
            ? "Posted"
            : count === 0
              ? "Choose accounts"
              : `Post to ${count} account${count === 1 ? "" : "s"}`}
        </span>
      </div>
      <div className="pt-2">
        <Filler rows={2} />
      </div>
    </Panel>
  );
}

const PREVIEW: Beat[] = [
  { ms: 1600, target: "rest" },
  { ms: 750, target: "tab-linkedin" },
  { ms: 260, target: "tab-linkedin", press: true },
  { ms: 1800, target: "tab-linkedin" },
  { ms: 650, target: "tab-instagram" },
  { ms: 260, target: "tab-instagram", press: true },
  { ms: 1800, target: "tab-instagram" },
  { ms: 650, target: "tab-twitter" },
  { ms: 260, target: "tab-twitter", press: true },
  { ms: 900, target: "rest" },
];

const POST =
  "Our spring collection drops Friday. Here’s a first look at the colors.";

function previewOf(step: number): Platform {
  if (step >= 3 && step < 6) return "linkedin";
  if (step >= 6 && step < 9) return "instagram";
  return "twitter";
}

function Preview({ step }: SceneProps) {
  const active = previewOf(step);
  const bar = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  }>();
  useLayoutEffect(() => {
    const node = bar.current?.querySelector<HTMLElement>(
      `[data-target="tab-${active}"]`
    );
    if (node) setIndicator({ left: node.offsetLeft, width: node.offsetWidth });
  }, [active]);
  return (
    <>
      <div
        ref={bar}
        className="absolute top-10 left-1/2 z-10 flex -translate-x-1/2 rounded-full bg-secondary p-1 ring-1 ring-border"
      >
        {indicator && (
          <span
            className="absolute top-1 bottom-1 rounded-full bg-background shadow-sm ring-1 ring-border transition-[left,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={indicator}
          />
        )}
        {CHANNELS.map((item) => (
          <span
            key={item.id}
            data-target={`tab-${item.id}`}
            className={cn(
              "relative flex h-7 items-center gap-1.5 rounded-full px-3 text-xs whitespace-nowrap transition-colors duration-300",
              active === item.id ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon name={item.id} size={13} />
            {item.name}
          </span>
        ))}
      </div>
      <Panel className="top-[92px] h-[256px]">
        <div className="grid border-b">
          {CHANNELS.map(({ id }) => (
            <div
              key={id}
              className={cn(
                "col-start-1 row-start-1 flex gap-3 p-4 transition-[opacity,translate] duration-300",
                active === id
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0"
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center bg-amber-500/15 text-sm font-medium text-amber-700 dark:text-amber-400",
                  id === "linkedin" ? "rounded-lg" : "rounded-full"
                )}
              >
                MC
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                {id === "twitter" && (
                  <p className="flex min-w-0 items-center gap-1.5 text-sm">
                    <span className="shrink-0 font-medium">Maya Chen</span>
                    <span className="truncate text-muted-foreground">
                      @mayamakes · now
                    </span>
                  </p>
                )}
                {id === "linkedin" && (
                  <p className="min-w-0 text-sm">
                    <span className="block font-medium">Maya Chen</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      Founder at Studio North · now
                    </span>
                  </p>
                )}
                {id === "instagram" && (
                  <p className="flex min-w-0 items-center gap-1.5 text-sm">
                    <span className="shrink-0 font-medium">mayamakes</span>
                    <span className="truncate text-muted-foreground">
                      Studio North
                    </span>
                  </p>
                )}
                <p className="text-[15px] leading-snug">
                  {POST}
                  {id === "instagram" && (
                    <span className="text-sky-700 dark:text-sky-400">
                      {" "}
                      #springdrop
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-10 pt-2 text-muted-foreground">
                  <Glyph icon={FavouriteIcon} />
                  <Glyph icon={Comment01Icon} />
                  <Glyph icon={RepeatIcon} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-4">
          <span className="size-10 shrink-0 rounded-full bg-muted" />
          <span className="flex-1 space-y-2 pt-1">
            <Bar className="w-1/3" />
            <Bar className="w-4/5" />
            <Bar className="w-3/5" />
          </span>
        </div>
      </Panel>
    </>
  );
}

const SCHEDULE: Beat[] = [
  { ms: 900, target: "rest" },
  { ms: 800, target: "day-13" },
  { ms: 260, target: "day-13", press: true },
  { ms: 700, target: "day-13" },
  { ms: 700, target: "schedule" },
  { ms: 260, target: "schedule", press: true },
  { ms: 2200, target: "schedule" },
  { ms: 900, target: "rest" },
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function Schedule({ step }: SceneProps) {
  const picked = step >= 3 && step < 7;
  const scheduled = step === 6;
  return (
    <Panel>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-medium">March 2026</span>
        <span className="flex gap-1 text-muted-foreground">
          <Glyph icon={ArrowLeft01Icon} />
          <Glyph icon={ArrowRight01Icon} />
        </span>
      </div>
      <div className="grid grid-cols-7 gap-y-1 px-3 text-center text-xs">
        {DAYS.map((day, index) => (
          <span key={index} className="py-1 text-muted-foreground">
            {day}
          </span>
        ))}
        {[1, 8, 15].flatMap((start) =>
          Array.from({ length: 7 }, (_, index) => {
            const date = start + index;
            return (
              <span key={date} className="grid place-items-center py-0.5">
                <span
                  data-target={`day-${date}`}
                  className={cn(
                    "grid size-8 place-items-center rounded-full tabular-nums transition-[background-color,color] duration-300",
                    date < 9 && "text-muted-foreground/60",
                    date === 13 && picked && "bg-brand text-brand-foreground"
                  )}
                >
                  {date}
                </span>
              </span>
            );
          })
        )}
      </div>
      <div className="mx-4 mt-3 flex items-center justify-between gap-3 border-t pt-3 pb-4">
        <span
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs whitespace-nowrap tabular-nums ring-1 ring-border transition-opacity duration-300",
            picked ? "opacity-100" : "opacity-50"
          )}
        >
          <Icon name="clock" size={14} className="text-muted-foreground" />
          {picked ? "Fri, Mar 13 · 12:30 PM" : "Pick a date"}
        </span>
        <span
          data-target="schedule"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs whitespace-nowrap transition-colors duration-300",
            scheduled
              ? "bg-emerald-600 text-white dark:bg-emerald-500"
              : "bg-primary text-primary-foreground"
          )}
        >
          {scheduled && <Glyph icon={Tick02Icon} size={14} />}
          {scheduled ? "Scheduled" : "Schedule"}
        </span>
      </div>
      <Filler rows={2} />
    </Panel>
  );
}

const MEDIA: Beat[] = [
  { ms: 900, target: "pickup", drag: true },
  { ms: 900, target: "drop", drag: true },
  { ms: 260, target: "drop" },
  { ms: 2600, target: "rest" },
  { ms: 1600, target: "rest" },
  { ms: 900, target: "pickup" },
];

function FileTile() {
  return (
    <span className="flex items-center gap-2 rounded-lg bg-background py-1.5 pr-3 pl-1.5 text-xs whitespace-nowrap shadow-[0_8px_24px_-8px_rgb(0_0_0/0.3)] ring-1 ring-foreground/10">
      <span className="grid size-6 place-items-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Glyph icon={Video01Icon} size={14} />
      </span>
      teaser.mp4
    </span>
  );
}

function Media({ step }: SceneProps) {
  const over = step === 1;
  const added = step >= 2 && step < 5;
  const uploading = step >= 3 && step < 5;
  const done = step === 4;
  return (
    <>
      <span
        data-target="pickup"
        className="absolute top-4 right-[12%] size-px"
      />
      <Panel>
        <div
          data-target="drop"
          className={cn(
            "m-3 flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors duration-300",
            over ? "border-brand bg-brand/5" : "bg-secondary/40"
          )}
        >
          <span className="grid size-9 place-items-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
            <Icon name="plus" size={16} />
          </span>
          <span className="text-sm">Drop photos or videos</span>
        </div>
        <ul className="px-2">
          <li className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Glyph icon={Image01Icon} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">
                spring-lookbook.jpg
              </span>
              <span className="block text-xs text-muted-foreground tabular-nums">
                2.4 MB
              </span>
            </span>
            <Glyph
              icon={Tick02Icon}
              className="mr-1 text-emerald-600 dark:text-emerald-400"
            />
          </li>
          <li>
            <Collapse open={added}>
              <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Glyph icon={Video01Icon} size={18} />
                </span>
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">teaser.mp4</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      18 MB
                    </span>
                  </span>
                  <span className="block h-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className={cn(
                        "block h-full w-full origin-left rounded-full bg-brand ease-out",
                        uploading
                          ? "scale-x-100 transition-transform duration-[2400ms]"
                          : "scale-x-[0.04]"
                      )}
                    />
                  </span>
                </span>
                <Glyph
                  icon={Tick02Icon}
                  className={cn(
                    "mr-1 text-emerald-600 transition-opacity duration-300 dark:text-emerald-400",
                    done ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            </Collapse>
          </li>
        </ul>
        <Filler rows={2} />
      </Panel>
    </>
  );
}

const WORKSPACE: Beat[] = [
  { ms: 1500, target: "rest" },
  { ms: 1200, target: "rest" },
  { ms: 750, target: "filter-Scheduled" },
  { ms: 260, target: "filter-Scheduled", press: true },
  { ms: 1900, target: "filter-Scheduled" },
  { ms: 650, target: "filter-All" },
  { ms: 260, target: "filter-All", press: true },
  { ms: 1400, target: "filter-All" },
  { ms: 700, target: "rest" },
];

const FILTERS: [string, number][] = [
  ["All", 24],
  ["Scheduled", 6],
  ["Posted", 16],
  ["Failed", 2],
];

const ROWS: { id: Platform; text: string; when: string; posted: boolean }[] = [
  {
    id: "instagram",
    text: "Behind the scenes",
    when: "Today, 9:00 AM",
    posted: true,
  },
  {
    id: "linkedin",
    text: "We’re hiring designers",
    when: "Tomorrow, 10:30 AM",
    posted: false,
  },
  {
    id: "twitter",
    text: "Spring drop is live",
    when: "Mon, 4:15 PM",
    posted: true,
  },
];

function Workspace({ step }: SceneProps) {
  const filter = step >= 4 && step < 7 ? "Scheduled" : "All";
  const arriving = step < 8;
  const live = step === 0;
  return (
    <Panel className="left-0 rounded-l-none sm:left-0">
      <div className="flex gap-1.5 border-b py-3 pr-4 pl-6 text-xs">
        {FILTERS.map(([label, count], index) => (
          <span
            key={label}
            data-target={`filter-${label}`}
            className={cn(
              "flex h-7 shrink-0 items-center gap-1.5 rounded-full px-3 transition-colors duration-300",
              filter === label
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
              index === 3 && "hidden sm:flex"
            )}
          >
            {label}
            <span
              className={cn(
                "min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 tabular-nums transition-colors duration-300",
                filter === label ? "bg-primary-foreground/15" : "bg-secondary"
              )}
            >
              {count}
            </span>
          </span>
        ))}
      </div>
      <ul className="py-2 pr-2 pl-4">
        {ROWS.map((row, index) => {
          const shown =
            (filter === "All" || !row.posted) && (index > 0 || arriving);
          const posting = index === 0 && live;
          return (
            <li key={row.id}>
              <Collapse open={shown}>
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary">
                    <Icon name={row.id} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{row.text}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {row.when}
                    </span>
                  </span>
                  <span className="mr-2 grid shrink-0 justify-items-end text-xs">
                    <span
                      className={cn(
                        "col-start-1 row-start-1 transition-all duration-300",
                        row.posted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground",
                        posting
                          ? "translate-y-2 opacity-0"
                          : "translate-y-0 opacity-100"
                      )}
                    >
                      {row.posted ? "Posted" : "Scheduled"}
                    </span>
                    {index === 0 && (
                      <span
                        className={cn(
                          "col-start-1 row-start-1 text-amber-600 transition-all duration-300 dark:text-amber-400",
                          posting
                            ? "translate-y-0 opacity-100"
                            : "-translate-y-2 opacity-0"
                        )}
                      >
                        Posting…
                      </span>
                    )}
                  </span>
                </div>
              </Collapse>
            </li>
          );
        })}
      </ul>
      <div className="pl-2">
        <Filler rows={2} />
      </div>
    </Panel>
  );
}

const SCENES: Record<
  FigureKind,
  {
    Scene: (props: SceneProps) => ReactNode;
    beats: Beat[];
    poster: number;
    carry?: ReactNode;
    label: string;
  }
> = {
  publish: {
    Scene: Publish,
    beats: PUBLISH,
    poster: 9,
    label:
      "A post composer: X, LinkedIn and Instagram are selected, then the post goes out to all three.",
  },
  workflow: {
    Scene: Preview,
    beats: PREVIEW,
    poster: 0,
    label:
      "A live preview of one post, switching between how it looks on X, LinkedIn and Instagram.",
  },
  schedule: {
    Scene: Schedule,
    beats: SCHEDULE,
    poster: 6,
    label:
      "A date picker: Friday, March 13 is chosen and the post is scheduled for 12:30 PM.",
  },
  media: {
    Scene: Media,
    beats: MEDIA,
    poster: 4,
    carry: <FileTile />,
    label:
      "A video is dropped into the upload area and finishes uploading next to a photo.",
  },
  workspace: {
    Scene: Workspace,
    beats: WORKSPACE,
    poster: 1,
    label:
      "A list of posts by status: a new post goes from Posting to Posted, then the list is filtered to scheduled posts.",
  },
};

export function FeatureFigure({ kind }: { kind: FigureKind }) {
  const figure = useRef<HTMLDivElement>(null);
  const inView = useInView(figure);
  const reduced = useReducedMotion();
  const { Scene, beats, poster, carry, label } = SCENES[kind];
  const step = useLoop(beats, inView && !reduced, reduced, poster);
  return (
    <div
      ref={figure}
      role="img"
      aria-label={label}
      className="relative h-[348px] min-w-0 overflow-hidden select-none"
    >
      <div aria-hidden="true" className="contents">
        <Rest />
        <Scene step={step} />
      </div>
      <Cursor
        figure={figure}
        beat={beats[step]!}
        hidden={reduced}
        carry={carry}
      />
    </div>
  );
}
