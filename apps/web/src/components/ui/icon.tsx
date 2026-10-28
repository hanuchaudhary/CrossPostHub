import type { IconProps, UiIconName } from "@/lib/types";
import { getChannel } from "@/lib/constants";
import { ChannelIcon } from "@/components/channels/channel-icon";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  Settings01Icon,
  UserCircleIcon,
  Logout01Icon,
  Add01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Menu01Icon,
  SparklesIcon,
  GoogleIcon,
  Notification01Icon,
  Search01Icon,
  Image01Icon,
  SentIcon,
  Link01Icon,
  Clock01Icon,
  Mail01Icon,
  Shield01Icon,
  MoreHorizontalIcon,
  CodeIcon,
  Layers01Icon,
  SquareLock02Icon,
} from "@hugeicons/core-free-icons";
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
