import { motion, useReducedMotion } from "motion/react";
import { Badge } from "./badge";
import type { ReactNode } from "react";
import { cn } from "cn";
import BaseUi from "@/components/ui/block-feature-utils/baseui";
import Shadcn from "@/components/ui/block-feature-utils/shadcn";
import Tailwind from "@/components/ui/block-feature-utils/tailwind";
import FeatureBuild from "@/components/ui/block-feature-utils/feature-build";
import FeatureMotion from "@/components/ui/block-feature-utils/feature-motion";
import FigmaLogo from "@/components/ui/block-feature-utils/figma-logo";
import FigmaOrbitRing from "@/components/ui/block-feature-utils/figma-orbit-ring";
import { Icon } from "./icon";
function Title({ children }: { children: ReactNode }) {
  return (
    <header className="flex flex-col gap-2 px-6">
      <h2 className="text-center text-xl leading-7 font-medium">{children}</h2>
    </header>
  );
}
function BaseUiGrid() {
  const cols = 5,
    rows = 3,
    highlight = 7;
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-[repeat(5,72px)] grid-rows-[repeat(3,72px)] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_35%,transparent_88%)]">
          {Array.from({ length: cols * rows }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex size-[72px] items-center justify-center border border-black/[0.09] dark:border-white/[0.1]",
                i === highlight && "bg-orange-50 dark:bg-orange-500/10",
              )}
            >
              {i === highlight && <BaseUi className="size-9 text-foreground" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function FigmaOrbit() {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[122px] w-[229px] shrink-0">
          <FigmaOrbitRing className="absolute top-[13px] left-0 h-[109px] w-[229px]" />
          <FigmaLogo className="absolute top-0 left-1/2 h-[93px] w-[62px] -translate-x-1/2" />
          <Icon
            name="sparkle"
            className="absolute top-[68px] left-[188px] size-[13px]"
          />
          <Icon
            name="sparkle"
            className="absolute top-[100px] left-[32px] size-[11px]"
          />
        </div>
      </div>
    </div>
  );
}
function CodeEditor() {
  const lines = [
    <>
      <span className="text-violet-600">export function </span>
      <span className="text-blue-600">FeatureBlock</span>
      {"() {"}
    </>,
    <>
      {"  "}
      <span className="text-violet-600">const</span>
      {" { state } = "}
      <span className="text-blue-600">useControl</span>
      {"();"}
    </>,
    <>
      {"  "}
      <span className="text-rose-500">&lt;motion.div</span>{" "}
      <span className="text-amber-500">layout</span>
    </>,
    <>
      {"    "}
      <span className="text-amber-500">className</span>=
      <span className="text-emerald-600">&quot;grid-item&quot;</span>&gt;
    </>,
    <>
      {"  "}
      <span className="text-rose-500">&lt;/motion.div&gt;</span>
    </>,
  ];
  return (
    <div className="relative flex-1">
      <div
        aria-hidden
        className="absolute right-6 bottom-2 left-6 h-40 rounded-3xl bg-orange-300/25 blur-2xl"
      />
      <div className="absolute right-4 -bottom-6 left-[-14px] overflow-hidden rounded-2xl border border-b-0 border-black/[0.07] bg-white shadow-[0_-8px_30px_rgba(16,24,40,0.06)] dark:border-white/10 dark:bg-neutral-900">
        <div className="flex items-center justify-between px-4 py-3 pl-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground">
              FeatureBlock.tsx
            </span>
          </div>
          <span className="text-xs text-muted-foreground">React + TS</span>
        </div>
        <div className="border-t border-black/[0.06] dark:border-white/10" />
        <pre className="overflow-hidden px-5 py-4 font-mono text-[13px] leading-6 text-foreground">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
// Hugeicons replaces the supplied Lucide and Tabler icons to match the app's icon system.
const techIcons = [
  {
    name: "base-ui",
    node: <BaseUi className="size-7 text-white" />,
    bg: "bg-neutral-950",
  },
  {
    name: "typescript",
    node: <Icon name="code" size={32} />,
    bg: "bg-[#3178C6]",
  },
  {
    name: "nextjs",
    node: <Icon name="layers" size={32} />,
    bg: "bg-neutral-950",
  },
  {
    name: "react",
    node: <Icon name="sparkle" size={32} />,
    bg: "bg-[#219ebc]",
  },
  {
    name: "shadcn",
    node: <Shadcn className="size-7 text-white" />,
    bg: "bg-neutral-950",
  },
  {
    name: "tailwind",
    node: <Tailwind className="size-8 text-white" />,
    bg: "bg-[#38BDF8]",
  },
];
function TechBelt() {
  const reduce = useReducedMotion();
  return (
    <div className="relative min-h-60 flex-1 overflow-hidden" aria-hidden>
      {reduce ? (
        <div className="flex h-full flex-wrap items-center justify-center gap-3 p-5">
          {techIcons.map((icon) => (
            <div
              key={icon.name}
              className={cn(
                "flex size-12 items-center justify-center rounded-xl text-white",
                icon.bg,
              )}
            >
              {icon.node}
            </div>
          ))}
        </div>
      ) : (
        techIcons.map((icon, i) => (
          <motion.div
            key={icon.name}
            className={cn(
              "absolute left-0 top-0 flex size-16 items-center justify-center rounded-2xl text-white shadow-lg",
              icon.bg,
            )}
            animate={{
              x: [-80, 60, 155, 260, 440],
              y: [165, 105, 85, 105, 165],
              rotate: [-12, -6, 0, 6, 12],
            }}
            transition={{
              duration: 22,
              delay: (-i * 22) / 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {icon.node}
          </motion.div>
        ))
      )}
    </div>
  );
}
export default function Feature() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:px-8"
    >
      <div className="mb-10 space-y-4 text-center">
        <Badge variant="outline">LESS BUSYWORK. MORE CREATING.</Badge>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          A little structure.
          <br />A lot more possibility.
        </h2>
        <p className="text-sm text-muted-foreground">
          A thoughtfully built toolkit that keeps you in your creative flow.
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr_1fr]">
          <section className="flex min-w-0 flex-col relative min-h-72 gap-0 overflow-hidden py-0 pt-8">
            <Title>Built on Base UI primitives from day one</Title>
            <BaseUiGrid />
          </section>
          <section className="flex min-w-0 flex-col relative min-h-72 gap-0 overflow-hidden py-0">
            <h3 className="sr-only">Built for the way you build</h3>
            <FeatureBuild className="h-auto w-full" />
          </section>
          <section className="flex min-w-0 flex-col relative min-h-72 gap-0 overflow-hidden py-0 pb-7">
            <FigmaOrbit />
            <Title>Connect your agent with Figma MCP</Title>
          </section>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <section className="flex min-w-0 flex-col relative min-h-66 gap-0 overflow-hidden py-0 pt-6">
            <Title>Full control over your code. Zero lock-in.</Title>
            <CodeEditor />
          </section>
          <section className="flex min-w-0 flex-col relative min-h-66 gap-0 overflow-hidden py-0">
            <h3 className="sr-only">
              Works with Base UI, TypeScript, Next.js, React, shadcn/ui and
              Tailwind CSS
            </h3>
            <TechBelt />
          </section>
          <section className="flex min-w-0 flex-col relative min-h-66 gap-0 overflow-hidden py-0">
            <h3 className="sr-only">Smooth animations with motion</h3>
            <FeatureMotion className="h-auto w-full" />
          </section>
        </div>
      </div>
    </section>
  );
}
