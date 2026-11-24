export function nextScheduledMinute(now: Date): Date {
  const next = new Date(now);
  next.setMinutes(next.getMinutes() + 1, 0, 0);
  return next;
}

export function isFutureSchedule(date: Date, now: Date): boolean {
  return Number.isFinite(date.getTime()) && date.getTime() > now.getTime();
}

export function withScheduleTime(
  day: Date,
  hour: number,
  minute: number
): Date {
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date;
}
