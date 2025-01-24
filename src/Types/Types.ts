
export interface User {
    id: string
    email: string
    password: string
    name: string
    image: string
    createdAt: string | Date
    updatedAt: string | Date
}

export interface ConnectedApp {
    userId?: string
    type?: string
    provider?: string
    providerAccountId?: string
    refresh_token?: string
    access_token?: string
    expires_at?: number
    token_type?: string
    scope?: string
    id_token?: string
    session_state?: string
    createdAt: Date
    updatedAt: Date
    user: User
}

export interface TwitterUser {
    id: string;
    name: string;
    screen_name: string;  // Username/handle
    profile_name: string; // Display name
    followers_count: number;
    friends_count: number;
    profile_image_url_https: string;
}

export type Providers = "twitter" | "linkedin" | "instagram" | "threads"