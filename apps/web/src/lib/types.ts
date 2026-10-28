import type { ComponentProps, ReactNode } from "react";
import type { authClient } from "./auth-client";

export type ChannelId =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "threads"
  | "facebook"
  | "bluesky"
  | "pinterest"
  | "tiktok"
  | "youtube"
  | "github";
/** Providers accepted by the existing publishing API. */
export type Platform = "twitter" | "linkedin" | "instagram";
export type Channel = {
  id: ChannelId;
  name: string;
  icon: string;
  iconClassName?: string;
  locked: boolean;
};
export type ChannelStatus = "locked" | "connected" | "disconnected";
export type ChannelIconProps = {
  channel: Channel;
  connected?: boolean;
  showLock?: boolean;
  size?: number;
  className?: string;
};
export type ChannelTooltipProps = { children: ReactNode; label: string };
export type UiIconName =
  | "arrow"
  | "back"
  | "external"
  | "calendar"
  | "dashboard"
  | "settings"
  | "user"
  | "logout"
  | "plus"
  | "check"
  | "close"
  | "menu"
  | "sparkle"
  | "google"
  | "bell"
  | "search"
  | "image"
  | "send"
  | "link"
  | "clock"
  | "mail"
  | "shield"
  | "more"
  | "code"
  | "layers"
  | "lock";
export type IconName = UiIconName | ChannelId;
export type IconProps = { name: IconName; size?: number; className?: string };
export type PostStatus = "PENDING" | "SUCCESS" | "FAILED";
export type Post = {
  id: string;
  text: string;
  provider: Platform;
  status: PostStatus;
  isScheduled: boolean;
  scheduledFor: string | null;
  createdAt: string;
  mediaKeys: string[];
};
export type PostGroups = {
  ScheduledPosts: Post[];
  PendingPosts: Post[];
  FailedPosts: Post[];
  SuccessPosts: Post[];
};
export type PostInput = {
  text: string;
  providers: Platform[];
  scheduleAt?: string;
  mediaKeys: string[];
};
export type UploadResponse = { url: string; key: string };
export type MonthlyData = {
  month: string;
  twitter: number;
  linkedin: number;
  instagram: number;
};
export type OverviewResponse = { monthlyData: MonthlyData[] };
export type Notification = {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
};
export type NotificationsResponse = { notifications: Notification[] };
export type SubscriptionResponse = {
  status: string;
  subscription?: { nextBillingAt?: string | null; plan: { title: string } };
};
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
export type ConnectedAccount = NonNullable<
  Awaited<ReturnType<typeof authClient.listAccounts>>["data"]
>[number];
export type AvatarDefinition = { name: string; url: string };
export type ProfileDraft = { name: string; image: string };
export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};
export type DisconnectAccountInput = { id: string };
export type Theme = "dark" | "light" | "system";
export type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};
export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};
export type LabelInputProps = ComponentProps<"input"> & {
  label?: string;
  field?: string;
  corner?: number;
  showcase?: boolean;
  isDisabled?: boolean;
};
export type PageHeadingProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
};
export type QueryStateProps = {
  pending: boolean;
  error: unknown;
  retry: () => void;
};
export type PostListProps = { posts: Post[]; compact?: boolean };
