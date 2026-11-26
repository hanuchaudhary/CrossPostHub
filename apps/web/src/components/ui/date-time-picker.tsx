import { useEffect, useMemo, useRef, useState } from "react";

import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STEP_MINUTES = 15;

const toValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function monthGrid(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  start.setDate(1 - start.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function slotsFor(day: Date, min?: Date, max?: Date) {
  const slots: Date[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += STEP_MINUTES) {
    const slot = new Date(day);
    slot.setHours(0, minutes, 0, 0);
    if (min && slot < min) continue;
    if (max && slot > max) continue;
    slots.push(slot);
  }
  return slots;
}

export function DateTimePicker({
  value,
  onChange,
  min,
  max,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  min?: Date;
  max?: Date;
  className?: string;
  "aria-label"?: string;
}) {
  const selected = useMemo(() => new Date(value), [value]);
  const valid = Number.isFinite(selected.getTime());
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() =>
    startOfDay(valid ? selected : new Date())
  );
  const selectedSlot = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    if (valid) setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    requestAnimationFrame(() =>
      selectedSlot.current?.scrollIntoView({ block: "center" })
    );
  }, [open, valid, selected]);

  const minDay = min ? startOfDay(min) : undefined;
  const maxDay = max ? startOfDay(max) : undefined;
  const dayAllowed = (day: Date) =>
    (!minDay || day >= minDay) &&
    (!maxDay || day <= maxDay) &&
    slotsFor(day, min, max).length > 0;

  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const canGoBack = !minDay || firstOfMonth > minDay;
  const canGoForward =
    !maxDay ||
    new Date(month.getFullYear(), month.getMonth() + 1, 1) <= maxDay;

  const slots = valid ? slotsFor(startOfDay(selected), min, max) : [];

  const pickDay = (day: Date) => {
    const daySlots = slotsFor(day, min, max);
    if (daySlots.length === 0) return;
    const wanted = new Date(day);
    wanted.setHours(
      valid ? selected.getHours() : 10,
      valid ? selected.getMinutes() : 0
    );
    const nearest = daySlots.reduce((best, slot) =>
      Math.abs(slot.getTime() - wanted.getTime()) <
      Math.abs(best.getTime() - wanted.getTime())
        ? slot
        : best
    );
    onChange(toValue(nearest));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            aria-label={ariaLabel}
            className={cn("font-normal tabular-nums", className)}
          />
        }
      >
        <IconCalendarEvent />
        {valid
          ? new Intl.DateTimeFormat(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(selected)
          : "Pick a time"}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="flex gap-3">
          <div className="w-64">
            <div className="mb-2 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Previous month"
                disabled={!canGoBack}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1)
                  )
                }
              >
                <IconChevronLeft />
              </Button>
              <span className="text-sm font-medium">
                {new Intl.DateTimeFormat(undefined, {
                  month: "long",
                  year: "numeric",
                }).format(month)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Next month"
                disabled={!canGoForward}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1)
                  )
                }
              >
                <IconChevronRight />
              </Button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
              {monthGrid(month)
                .slice(0, 7)
                .map((day) => (
                  <span key={day.getDay()} className="py-1">
                    {new Intl.DateTimeFormat(undefined, {
                      weekday: "narrow",
                    }).format(day)}
                  </span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {monthGrid(month).map((day) => {
                const allowed = dayAllowed(day);
                const isSelected = valid && sameDay(day, selected);
                const inMonth = day.getMonth() === month.getMonth();
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={!allowed}
                    onClick={() => pickDay(day)}
                    aria-pressed={isSelected}
                    className={cn(
                      "grid aspect-square cursor-pointer place-items-center rounded-lg text-xs tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary",
                      !inMonth && !isSelected && "text-muted-foreground",
                      sameDay(day, new Date()) &&
                        !isSelected &&
                        "ring-1 ring-border"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className="flex h-72 w-24 flex-col gap-0.5 overflow-y-auto border-l pl-3"
            role="listbox"
            aria-label="Time"
          >
            {slots.length === 0 && (
              <p className="text-xs text-muted-foreground">Pick a day</p>
            )}
            {slots.map((slot) => {
              const active = valid && slot.getTime() === selected.getTime();
              return (
                <button
                  key={slot.getTime()}
                  ref={active ? selectedSlot : undefined}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(toValue(slot));
                    setOpen(false);
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-md px-2 py-1 text-left text-xs tabular-nums",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(slot)}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
