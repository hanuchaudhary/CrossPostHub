import type { ComponentType } from "react";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CircleCheck,
  CircleUser,
  Clock,
  Code,
  CreditCard,
  Image,
  Layers,
  LayoutDashboard,
  Link,
  Lock,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  X,
  type IconProps as KeylineProps,
} from "@keyline-icons/react/duotone";

import { ChannelIcon } from "@/components/channels/channel-icon";
import { getChannel } from "@/lib/constants";
import type { IconProps, UiIconName } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons: Record<Exclude<UiIconName, "google">, ComponentType<KeylineProps>> = {
  arrow: ArrowRight,
  back: ArrowLeft,
  external: ArrowUpRight,
  calendar: CalendarDays,
  dashboard: LayoutDashboard,
  settings: Settings,
  user: CircleUser,
  logout: LogOut,
  plus: Plus,
  check: CircleCheck,
  close: X,
  menu: Menu,
  sparkle: Sparkles,
  bell: Bell,
  search: Search,
  image: Image,
  send: Send,
  link: Link,
  clock: Clock,
  mail: Mail,
  shield: Shield,
  more: MoreHorizontal,
  code: Code,
  layers: Layers,
  lock: Lock,
  billing: CreditCard,
  edit: SquarePen,
  share: Share2,
  sliders: SlidersHorizontal,
};

export type { IconName } from "@/lib/types";

export function Icon({ name, size = 20, className = "" }: IconProps) {
  const channel = getChannel(name);
  if (channel)
    return (
      <ChannelIcon
        channel={channel}
        size={size}
        connected
        showLock={false}
        className={className}
      />
    );
  if (name === "google")
    return (
      <img
        src="/icons/google-icon.svg"
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0", className)}
        aria-hidden="true"
      />
    );
  const Glyph = icons[name as Exclude<UiIconName, "google">];
  return (
    <Glyph
      size={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    />
  );
}
