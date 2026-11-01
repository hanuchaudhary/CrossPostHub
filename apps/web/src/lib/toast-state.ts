import type { ReactNode } from "react";

export const TOAST_EVENT = "kobra:toast";
export const TOAST_DISMISS_EVENT = "kobra:toast-dismiss";
export const LINE_HEIGHT = 36;
export type ToastSide = "top" | "bottom";
export type ToastAlign = "start" | "center" | "end" | "left" | "right";
export type ToastPosition = `${ToastSide}-${ToastAlign}`;
export const toastPositions = [
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
] as const satisfies readonly ToastPosition[];
export type ToastState = "pending" | "success" | "error" | "warning" | "info";
export type ToastAction = { label: string; run: () => void };
export type ToastInput = {
  id?: string;
  message: string;
  description?: string;
  state?: ToastState;
  action?: ToastAction;
  lifetime?: number;
};
export type Note = ToastInput & { id: string };
export type ToastClock = { waits: Map<string, number>; since: number | null };
export type StackSlot = { y: number; scale: number; opacity: number };
export type StackCard = { id: string; render: (behind: boolean) => ReactNode };
let nextId = 0;

export function toast(input: string | ToastInput) {
  const detail = typeof input === "string" ? { message: input } : input;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { ...detail, id: detail.id ?? `toast-${++nextId}` },
    })
  );
}
export function dismissToast(id: string) {
  window.dispatchEvent(new CustomEvent(TOAST_DISMISS_EVENT, { detail: id }));
}
export function upsertToast(notes: readonly Note[], note: Note): Note[] {
  const index = notes.findIndex((item) => item.id === note.id);
  return index === -1
    ? [note, ...notes]
    : notes.map((item, at) => (at === index ? note : item));
}
export function dismissDelay(
  state: ToastState | undefined,
  hasAction: boolean,
  lifetime?: number,
  hasDetail = false
): number | null {
  if (state === "pending") return null;
  if (lifetime !== undefined) return lifetime;
  return hasAction ? 6000 : hasDetail ? 4000 : 2400;
}
export function tick(clock: ToastClock, at: number) {
  if (clock.since === null) return;
  const spent = at - clock.since;
  clock.since = at;
  for (const [id, left] of clock.waits) clock.waits.set(id, left - spent);
}
export function pileSlot(index: number): StackSlot {
  const depth = Math.min(index, 2);
  return {
    y: depth * 10,
    scale: 1 - depth * 0.03,
    opacity: index < 3 ? 1 - depth * 0.15 : 0,
  };
}
export function fanSlot(index: number, heights: readonly number[]): StackSlot {
  let y = 0;
  for (let at = 0; at < index; at++) y += (heights[at] ?? LINE_HEIGHT) + 8;
  return { y, scale: 1, opacity: 1 };
}
