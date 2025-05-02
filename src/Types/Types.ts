export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  image: string;

  accounts: Account[];
  plans: Plan[];
  posts: Post[];
  plansId: string;

  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Account {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string;
  access_token: string;
  expires_at: number;
  token_type: string;
  scope: string;
  id_token: string;
  session_state: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  razorpayPlanId?: string;
  subscriptions: SubscriptionType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionType {
  id: string;
  userId: string;
  user: User;
  planId: string;
  plan: Plan;
  razorpaySubscriptionId?: string;
  status: string;
  nextBillingAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  transactions: TransactionType[];
}

export enum STATUS {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface IGeneratedImage {
  id: string;
  caption: string | null;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id?: string;
  text?: string;
  userId?: string;
  mediaKeys?: string[];
  scheduledFor?: Date;
  isScheduled?: boolean;
  status?: STATUS;
  provider?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConnectedApp {
  userId?: string;
  type?: string;
  provider?: string;
  providerAccountId?: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface TransactionType {
  id: string;
  userId: string;
  user: User;
  subscriptionId?: string;
  subscription: SubscriptionType;
  order_id?: string;
  paymentId?: string;
  amount?: number;
  status: STATUS;
  paymentMethod?: string;
  invoiceId?: string;
  captured?: boolean;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationType {
  id: number;
  message: string;
  type:
    | "POST_STATUS_PROCESSING"
    | "POST_STATUS_SUCCESS"
    | "POST_STATUS_FAILED"
    | "SYSTEM_ALERT";
  userId: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwitterUser {
  id: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: string | null;
  profile_image_url: string;
  followers_count: number;
  friends_count: number;
  createdAt: string; // Twitter uses ISO strings for dates
  verified: boolean;
  profile_image_url_https: string;
  profile_banner_url?: string;
  profile_background_color?: string;
}

export type Providers = "twitter" | "linkedin" | "instagram" | "threads";
export type BorderStyle = "solid" | "double" | "dashed" | "dotted" | "none";
