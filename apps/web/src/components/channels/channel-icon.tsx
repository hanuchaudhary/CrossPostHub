import { Lock } from "@keyline-icons/react/duotone";

import type { ChannelIconProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChannelIcon({
  channel,
  connected = false,
  showLock = true,
  size = 24,
  className,
}: ChannelIconProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className
      )}
      aria-hidden="true"
      style={{ width: size, height: size }}
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
        width={size}
        height={size}
        className={cn(
          "block size-full max-h-full max-w-full shrink-0 object-contain",
          channel.iconClassName,
          !connected && "grayscale opacity-40"
        )}
      />
      {channel.locked && showLock && (
        <span className="absolute inset-0 grid place-items-center rounded bg-background/60">
          <Lock className="size-6" />
        </span>
      )}
    </span>
  );
}
