import { expect, test } from "bun:test";

import {
  isFutureSchedule,
  nextScheduledMinute,
  withScheduleTime,
} from "../../apps/web/src/components/posts/schedule-time";

test("past hours and elapsed minutes in the current hour are unavailable", () => {
  const now = new Date(2026, 9, 30, 1, 35, 42);
  expect(isFutureSchedule(withScheduleTime(now, 0, 59), now)).toBe(false);
  expect(isFutureSchedule(withScheduleTime(now, 1, 34), now)).toBe(false);
  expect(isFutureSchedule(withScheduleTime(now, 1, 35), now)).toBe(false);
  expect(isFutureSchedule(withScheduleTime(now, 1, 36), now)).toBe(true);
  expect(isFutureSchedule(withScheduleTime(now, 2, 0), now)).toBe(true);
});
test("all times on a future date remain available", () => {
  const now = new Date(2026, 9, 30, 23, 58);
  expect(
    isFutureSchedule(withScheduleTime(new Date(2026, 9, 31), 0, 0), now)
  ).toBe(true);
});
test("earliest schedulable minute rounds forward and crosses midnight", () => {
  const now = new Date(2026, 9, 30, 23, 59, 59);
  expect(nextScheduledMinute(now)).toEqual(new Date(2026, 9, 31, 0, 0, 0));
  expect(now.getDate()).toBe(30);
});
test("selection expires as the clock advances", () => {
  const selected = new Date(2026, 9, 30, 14, 0);
  expect(isFutureSchedule(selected, new Date(2026, 9, 30, 13, 59, 59))).toBe(
    true
  );
  expect(isFutureSchedule(selected, new Date(2026, 9, 30, 14, 0))).toBe(false);
  expect(isFutureSchedule(new Date("invalid"), new Date())).toBe(false);
});
