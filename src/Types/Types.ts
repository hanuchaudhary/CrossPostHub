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
  description: string;
  features: string[];
  cta: string;
  price: number;
  users: User[];
  createdAt: Date;
  updatedAt: Date;
  transaction: TransactionType[];
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

enum STATUS {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface Post {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
  captured?: Boolean;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationType {
  id: number;
  message: string;
  type: string;
  userId: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwitterUser {
  id: string;
  name: string;
  screen_name: string; // Username/handle
  profile_name: string; // Display name
  followers_count: number;
  friends_count: number;
  profile_image_url_https: string;
}

export type Providers = "twitter" | "linkedin" | "instagram" | "threads";
