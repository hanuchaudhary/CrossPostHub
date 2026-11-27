import type { ReactNode } from "react";
import { Link } from "react-router";

import { CircleCheck, Plus } from "@keyline-icons/react/duotone";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import type { SocialConnection, SocialProvider } from "@/lib/api/post";
import { cn } from "@/lib/utils";

import { iconInvert, PROVIDERS } from "./use-social";

export const MAX_SCHEDULE_DAYS = 30;

export const FULL_PAGE_DIALOG =
  "h-[calc(100dvh-2rem)] max-h-none w-[calc(100vw-2rem)] max-w-none sm:max-w-none";

export const localInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export const nextHour = () => {
  const date = new Date(Date.now() + 15 * 60_000);
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
};

export const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const metaOf = (provider: SocialProvider) =>
  PROVIDERS.find((item) => item.id === provider);

export const iconOf = (provider: SocialProvider) =>
  metaOf(provider)?.icon ?? "";

export const hashtags = (text: string) =>
  text.match(/#[\p{L}\p{N}_]+/gu)?.length ?? 0;

export function Counter({
  value,
  max,
  unit,
}: {
  value: number;
  max: number;
  unit?: string;
}) {
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        value > max ? "text-destructive" : "text-muted-foreground"
      )}
    >
      {value}/{max}
      {unit && ` ${unit}`}
    </span>
  );
}

export function Field({
  id,
  label,
  provider,
  counter,
  children,
}: {
  id: string;
  label: string;
  provider?: SocialProvider;
  counter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 pl-1">
        <Label htmlFor={id} className="flex items-center gap-1.5">
          {provider && (
            <img
              src={iconOf(provider)}
              alt=""
              className={cn("size-3.5", iconInvert(metaOf(provider) ?? {}))}
            />
          )}
          {label}
        </Label>
        <span className="flex gap-2">{counter}</span>
      </div>
      {children}
    </div>
  );
}

export function Section({
  provider,
  title,
  icon,
  note,
  children,
}: {
  provider?: SocialProvider;
  title?: string;
  icon?: ReactNode;
  note?: string;
  children: ReactNode;
}) {
  const meta = provider ? metaOf(provider) : undefined;
  return (
    <section className="rounded-2xl bg-popover p-1 ring-1 ring-foreground/10">
      <div className="flex items-center gap-3 rounded-xl bg-secondary p-2.5 shadow ring-2 ring-muted">
        <span className="grid h-8 min-w-8 shrink-0 place-items-center rounded-lg bg-background px-1">
          {meta ? (
            <img
              src={meta.icon}
              alt=""
              className={cn("size-4.5", iconInvert(meta))}
            />
          ) : (
            icon
          )}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-medium">{title ?? meta?.label}</h3>
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
      </div>
      <div className="space-y-4 p-3">{children}</div>
    </section>
  );
}

export function AccountPicker({
  connections,
  selected,
  onToggle,
  onConnect,
}: {
  connections: SocialConnection[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onConnect?: () => void;
}) {
  return (
    <div className="space-y-2">
      {connections.length === 0 && (
        <p className="text-muted-foreground txt text-base pb-2">
          No accounts connected yet. Connect one to start posting.
        </p>
      )}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Post to">
        {connections.map((connection) => {
          const on = selected.has(connection.id);
          const active = connection.status === "ACTIVE";
          return (
            <button
              key={connection.id}
              type="button"
              aria-pressed={on}
              disabled={!active}
              onClick={() => onToggle(connection.id)}
              title={
                active
                  ? undefined
                  : "Access expired: reconnect it on the Social accounts page"
              }
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-xs ring-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                on
                  ? "bg-foreground text-background ring-foreground"
                  : "ring-border hover:bg-secondary"
              )}
            >
              <span className="grid size-5 place-items-center rounded-full bg-background">
                <img
                  src={iconOf(connection.provider)}
                  alt=""
                  className={cn(
                    "size-3.5",
                    iconInvert(metaOf(connection.provider) ?? {})
                  )}
                />
              </span>
              {connection.name}
              {on && <CircleCheck className="size-3.5" />}
            </button>
          );
        })}
        <Button
          type="button"
          size="lg"
          variant="primary"
          nativeButton={false}
          render={<Link to="/connections" onClick={onConnect} />}
        >
          <Plus className="size-3.5" />
          Connect accounts
        </Button>
      </div>
    </div>
  );
}

export function Segment<T extends string | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Segmented
      label={label}
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}
