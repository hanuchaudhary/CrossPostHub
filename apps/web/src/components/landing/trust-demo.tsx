import { useEffect, useState } from "react";

import { Lock } from "@keyline-icons/react/duotone";

import {
  type Act,
  Badge,
  Bar,
  Button,
  Card,
  type Layout,
  Popover,
  Roll,
  Row,
  Stage,
  Swap,
  Text,
  Window,
} from "@/components/stageshow/kit";
import "@/components/stageshow/kit/stageshow.css";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type S = { connected: boolean; confirm: boolean };

const initial: S = { connected: true, confirm: false };
const poster: S = { connected: false, confirm: false };

const TOKENS = {
  "--ss-font": '"Inter Variable", ui-sans-serif, system-ui, sans-serif',
  "--ss-accent": "var(--brand)",
  "--ss-accent-soft": "color-mix(in oklch, var(--brand) 12%, transparent)",
  "--ss-surface": "var(--background)",
  "--ss-canvas": "var(--secondary)",
  "--ss-chrome": "var(--sidebar)",
  "--ss-raised": "var(--popover)",
  "--ss-line": "var(--border)",
  "--ss-text-strong": "var(--foreground)",
  "--ss-text":
    "color-mix(in oklch, var(--foreground) 80%, var(--muted-foreground))",
  "--ss-text-faint": "var(--muted-foreground)",
  "--ss-icon": "var(--foreground)",
  "--ss-icon-faint": "var(--muted-foreground)",
  "--ss-radius-sm": "8px",
  "--ss-radius-md": "10px",
  "--ss-radius-lg": "14px",
  "--ss-radius-window": "18px",
};

const HANDLE = "@kush.studio";
const TOKEN = "v1:9fKq·Zx2c·Q7mB";

async function script(a: Act<S>) {
  await a.wait(900);
  a.mark("disconnect");
  await a.click({ at: "action", x: 0.5, y: 0.55 });
  await a.set({ confirm: true });
  await a.wait(900);
  a.mark("confirm");
  await a.click({ at: "confirm", x: 0.5, y: 0.55 });
  await a.set({ confirm: false });
  await a.wait(140);
  await a.set({ connected: false });
  await a.wait(2600);
  a.mark("reconnect");
  await a.click({ at: "action", x: 0.5, y: 0.55 });
  await a.set({ connected: true });
  await a.wait(1400);
  await a.move({ at: "list", x: 0.62, y: 0.04 });
  await a.wait(900);
}

const GEO: Record<
  Layout,
  { win: { x: number; y: number; w: number; h: number } }
> = {
  wide: { win: { x: 112, y: 24, w: 464, h: 420 } },
  compact: { win: { x: 16, y: 20, w: 326, h: 380 } },
};

const NAV = [
  { w: 46 },
  { w: 52 },
  { w: 40 },
  { w: 50 },
  { w: 58, active: true },
  { w: 44 },
];

function useStageTheme() {
  const { theme } = useTheme();
  const [system, setSystem] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return theme === "system" ? system : theme;
}

function ChannelTile({ src, iconClass }: { src: string; iconClass?: string }) {
  return (
    <span className="grid size-8 flex-none place-items-center rounded-[10px] bg-background ring-1 ring-border">
      <img src={src} alt="" className={cn("size-4", iconClass)} />
    </span>
  );
}

function Sidebar() {
  return (
    <div className="flex flex-col gap-0.5 px-2 pt-11">
      {NAV.map(({ w, active }, index) => (
        <span
          key={index}
          className={cn(
            "flex h-[30px] items-center gap-2.5 rounded-lg px-2 text-muted-foreground",
            active && "bg-background text-foreground ring-1 ring-border"
          )}
        >
          <Bar w={14} h={14} tone={active ? 3 : 2} />
          <Bar w={w} h={6} tone={active ? 3 : 2} />
        </span>
      ))}
    </div>
  );
}

function Accounts({ s, layout }: { s: S; layout: Layout }) {
  return (
    <div className="-mx-2 mt-1 flex flex-col" data-target="list">
      <Row
        className="rounded-[10px]!"
        pad={10}
        lead={<ChannelTile src="/x-icon.svg" iconClass="dark:invert" />}
        title={<Text>X</Text>}
        subtitle={<Bar w={92} h={6} tone={2} />}
      />
      <Row
        className="rounded-[10px]! bg-secondary!"
        pad={10}
        lead={<ChannelTile src="/instagram-icon.svg" />}
        title={<Text>Instagram</Text>}
        subtitle={
          <Swap
            id={s.connected ? "on" : "off"}
            className="text-xs text-muted-foreground"
          >
            {s.connected ? (
              <span>{HANDLE} · Connected</span>
            ) : (
              <span className="text-red-700 dark:text-red-400">
                {layout === "compact" ? "Access deleted" : "Not connected"}
              </span>
            )}
          </Swap>
        }
        meta={
          <Button
            size="small"
            variant={s.connected ? "secondary" : "primary"}
            data-target="action"
            data-cursor="pointer"
            data-open={s.confirm || undefined}
          >
            {s.connected ? "Disconnect" : "Connect"}
          </Button>
        }
      />
      <Row
        className="rounded-[10px]!"
        pad={10}
        lead={<ChannelTile src="/linkedin-icon.svg" />}
        title={<Text>LinkedIn</Text>}
        subtitle={<Bar w={110} h={6} tone={2} />}
      />
      <Row
        className="rounded-[10px]!"
        pad={10}
        lead={<ChannelTile src="/icons/bluesky-icon.svg" />}
        title={<Bar w={64} h={8} tone={2} />}
        subtitle={<Bar w={84} h={6} tone={2} />}
      />
      <Row
        className="rounded-[10px]!"
        pad={10}
        lead={
          <ChannelTile
            src="/icons/threads-icon.svg"
            iconClass="invert dark:invert-0"
          />
        }
        title={<Bar w={56} h={8} tone={2} />}
        subtitle={<Bar w={98} h={6} tone={2} />}
      />
    </div>
  );
}

function Access({ connected }: { connected: boolean }) {
  return (
    <Card
      className="absolute! top-[150px] left-6 w-[196px] rounded-2xl! bg-popover! shadow-(--ss-shadow-satellite)!"
      pad="medium"
      gap={12}
    >
      <div className="flex items-center gap-2">
        <span className="grid size-7 flex-none place-items-center rounded-lg bg-secondary text-foreground">
          <Lock size={16} aria-hidden="true" />
        </span>
        <span className="text-[13px] font-medium text-foreground">
          Instagram access
        </span>
      </div>
      <Swap id={connected ? "on" : "off"} className="text-xs leading-snug">
        {connected ? (
          <span className="font-mono text-[11px] text-foreground/80">
            {TOKEN}
          </span>
        ) : (
          <span className="text-foreground/80">Deleted from our servers</span>
        )}
      </Swap>
      <Badge
        tone={connected ? "neutral" : "danger"}
        dot
        className="justify-self-start!"
      >
        <Roll variant="fade">{connected ? "AES-256-GCM" : "Revoked"}</Roll>
      </Badge>
    </Card>
  );
}

export function TrustDemo() {
  const theme = useStageTheme();
  return (
    <Stage<S>
      width={600}
      height={380}
      compact={{ below: 480, width: 358, height: 340 }}
      initial={initial}
      poster={poster}
      script={script}
      theme={theme === "dark" ? "dark" : "light"}
      tokens={TOKENS}
      cursor={{
        at: { at: "list", x: 0.62, y: 0.04 },
        style: "real",
      }}
      className="[&_.ss-stage]:overflow-hidden! [&_.ss-stage]:font-light [&_.ss-stage]:tracking-[-0.01em]"
    >
      {(s, rect, layout) => {
        const g = GEO[layout].win;
        const action = rect("action");
        const pop = {
          left: action.x + action.width - 232,
          top: action.y + action.height + 8,
          width: 232,
        };
        const frame = { left: g.x, top: g.y, width: g.w, height: g.h };
        return (
          <>
            {layout === "wide" ? (
              <Window
                className="absolute! shadow-(--ss-shadow-hero)!"
                style={frame}
                title="Social accounts"
                sidebar={<Sidebar />}
                sidebarWidth={120}
                body={{ className: "px-4!", "data-crop": true }}
              >
                <Accounts s={s} layout={layout} />
              </Window>
            ) : (
              <Window
                className="absolute! shadow-(--ss-shadow-hero)!"
                style={frame}
                title="Social accounts"
                body={{ className: "px-4!", "data-crop": true }}
              >
                <Accounts s={s} layout={layout} />
              </Window>
            )}
            {layout === "wide" && <Access connected={s.connected} />}
            <Popover
              show={s.confirm}
              origin="top right"
              className="p-3.5! [--ss-popover-bg:var(--popover)]"
              style={pop}
            >
              <div className="text-[13px] font-medium text-foreground">
                Disconnect Instagram?
              </div>
              <div className="mt-1.5 flex justify-end gap-2">
                <Button size="small" variant="ghost">
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  data-target="confirm"
                  data-cursor="pointer"
                >
                  Disconnect
                </Button>
              </div>
            </Popover>
          </>
        );
      }}
    </Stage>
  );
}
