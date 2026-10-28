import { HugeiconsIcon } from "@hugeicons/react";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { ChannelIconProps } from "@/lib/types";

export function ChannelIcon({
  channel,
  connected = false,
  showLock = true,
  className,
}: ChannelIconProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden="true"
      data-channel={channel.id}
      data-status={
        channel.locked && showLock
          ? "locked"
          : connected
            ? "connected"
            : "disconnected"
      }
    >
      <img
        src={channel.icon}
        alt=""
        className={cn(
          "block shrink-0 object-contain",
          channel.iconClassName,
          !connected && "grayscale opacity-40",
        )}
      />
      {channel.locked && showLock && (
        <span className="absolute inset-0 grid place-items-center rounded bg-background/60">
          <HugeiconsIcon
            icon={SquareLock02Icon}
            strokeWidth={2}
            className={"size-6"}
          />
        </span>
      )}
    </span>
  );
}
