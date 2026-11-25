import { cn } from "@/lib/utils";

import { PROVIDERS } from "./use-social";

export function ProviderStack({
  size = "sm",
  className,
}: {
  size?: "xs" | "sm" | "lg";
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("flex -space-x-1.5", className)}>
      {PROVIDERS.map((provider) => (
        <span
          key={provider.id}
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-background ring-2 ring-background",
            size === "xs"
              ? "size-4"
              : size === "sm"
                ? "size-5"
                : size === "lg"
                  ? "size-7"
                  : ""
          )}
        >
          <img
            src={provider.icon}
            alt=""
            className={cn(
              size === "xs" ? "size-2.5" : size === "sm"
              ? "size-3"
              : size === "lg"
                ? "size-5"
                : "",
              provider.id === "x" && "dark:invert"
            )}
          />
        </span>
      ))}
    </span>
  );
}
