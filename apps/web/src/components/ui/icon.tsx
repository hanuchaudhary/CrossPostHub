import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CodeIcon,
  DashboardSquare01Icon,
  GoogleIcon,
  Image01Icon,
  Layers01Icon,
  Link01Icon,
  Logout01Icon,
  Mail01Icon,
  Menu01Icon,
  MoreHorizontalIcon,
  Notification01Icon,
  Search01Icon,
  SentIcon,
  Settings01Icon,
  Shield01Icon,
  SparklesIcon,
  SquareLock02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ChannelIcon } from "@/components/channels/channel-icon";
import { getChannel } from "@/lib/constants";
import type { IconProps, UiIconName } from "@/lib/types";

const icons = {
  arrow: ArrowRight01Icon,
  back: ArrowLeft01Icon,
  external: ArrowUpRight01Icon,
  calendar: Calendar03Icon,
  dashboard: DashboardSquare01Icon,
  settings: Settings01Icon,
  user: UserCircleIcon,
  logout: Logout01Icon,
  plus: Add01Icon,
  check: CheckmarkCircle02Icon,
  close: Cancel01Icon,
  menu: Menu01Icon,
  sparkle: SparklesIcon,
  google: GoogleIcon,
  bell: Notification01Icon,
  search: Search01Icon,
  image: Image01Icon,
  send: SentIcon,
  link: Link01Icon,
  clock: Clock01Icon,
  mail: Mail01Icon,
  shield: Shield01Icon,
  more: MoreHorizontalIcon,
  code: CodeIcon,
  layers: Layers01Icon,
  lock: SquareLock02Icon,
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
  return (
    <HugeiconsIcon
      icon={icons[name as UiIconName]}
      size={size}
      strokeWidth={1.7}
      className={className}
      aria-hidden="true"
    />
  );
}
