import { cn } from "@/lib/utils";

export function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const percentage =
    limit === null ? null : Math.round((used / Math.max(1, limit)) * 100);
  const filled =
    limit === null ? 0 : Math.ceil(Math.min(1, used / Math.max(1, limit)) * 40);
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-sm tabular-nums">
          {used.toLocaleString()}{" "}
          <span className="text-muted-foreground">
            / {limit === null ? "Unlimited" : limit.toLocaleString()}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-5 sm:gap-7">
        <div
          role={limit === null ? "img" : "meter"}
          aria-label={label}
          aria-valuemin={limit === null ? undefined : 0}
          aria-valuemax={limit ?? undefined}
          aria-valuenow={limit === null ? undefined : Math.min(used, limit)}
          aria-valuetext={
            limit === null
              ? undefined
              : `${percentage}% used, ${used} of ${limit}`
          }
          className="grid h-9 min-w-0 flex-1 grid-cols-[repeat(40,minmax(0,1fr))] gap-1 sm:gap-2"
        >
          {Array.from({ length: 40 }, (_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={cn(
                "h-full w-full max-w-1.5 justify-self-center rounded-full bg-foreground/20",
                index < filled && "bg-emerald-500"
              )}
            />
          ))}
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-2xl font-light tracking-tight text-muted-foreground tabular-nums"
        >
          {percentage === null ? "Unlimited" : `${percentage}%`}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {limit === null
          ? "Create at your own pace. No monthly limit."
          : used >= limit
            ? "Monthly allowance used. Compare plans for more room."
            : `${limit - used} remaining this month`}
      </p>
    </div>
  );
}
