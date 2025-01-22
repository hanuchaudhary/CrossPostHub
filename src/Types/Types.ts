
export interface User {
    id: string
    email: string
    password: string
    username: string
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

export type Providers = "twitter" | "linkedin" | "instagram" | "threads"