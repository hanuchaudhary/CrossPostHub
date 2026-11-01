import { expect, test } from "bun:test";

import {
  dismissDelay,
  fanSlot,
  type Note,
  pileSlot,
  tick,
  type ToastClock,
  upsertToast,
} from "../../apps/web/src/lib/toast-state";
import { cn } from "../../apps/web/src/lib/utils";

test("a pending toast becomes a result in place, without mutating or duplicating the stack", () => {
  const original: Note[] = [
    { id: "new", message: "Another notification" },
    { id: "upload", message: "Uploading", state: "pending" },
  ];
  const result = upsertToast(original, {
    id: "upload",
    message: "Uploaded",
    state: "success",
  });
  expect(result.map((note) => note.id)).toEqual(["new", "upload"]);
  expect(result[1]?.state).toBe("success");
  expect(original[1]?.state).toBe("pending");
  expect(
    upsertToast(result, { id: "third", message: "Newest" }).map(
      (note) => note.id
    )
  ).toEqual(["third", "new", "upload"]);
});

test("pending notifications do not expire and action/detail notifications allow longer reading", () => {
  expect(dismissDelay("pending", false, 10)).toBeNull();
  expect(dismissDelay("success", false)).toBe(2400);
  expect(dismissDelay("error", false, undefined, true)).toBe(4000);
  expect(dismissDelay("info", true)).toBe(6000);
  expect(dismissDelay(undefined, true, 10000, true)).toBe(10000);
});

test("hover, focus or hidden-page pauses do not consume remaining lifetime", () => {
  const clock: ToastClock = {
    waits: new Map([
      ["first", 2400],
      ["second", 6000],
    ]),
    since: 100,
  };
  tick(clock, 600);
  expect([...clock.waits.values()]).toEqual([1900, 5500]);
  clock.since = null;
  tick(clock, 10600);
  expect([...clock.waits.values()]).toEqual([1900, 5500]);
  clock.since = 10600;
  tick(clock, 12600);
  expect([...clock.waits.values()]).toEqual([-100, 3500]);
});

test("only three stacked layers remain visible, while expanded cards respect measured heights", () => {
  expect(pileSlot(0)).toEqual({ y: 0, scale: 1, opacity: 1 });
  expect(pileSlot(2)).toEqual({ y: 20, scale: 0.94, opacity: 0.7 });
  expect(pileSlot(3).opacity).toBe(0);
  expect(fanSlot(0, [36, 80])).toEqual({ y: 0, scale: 1, opacity: 1 });
  expect(fanSlot(2, [36, 80]).y).toBe(132);
  expect(fanSlot(2, []).y).toBe(88);
});

test("caller classes override defaults using clsx and Tailwind v4 merging", () => {
  expect(cn("fixed top-4 px-4", false, ["top-8"], { "px-8": true })).toBe(
    "fixed top-8 px-8"
  );
  expect(cn("size-4", "size-6")).toBe("size-6");
});
