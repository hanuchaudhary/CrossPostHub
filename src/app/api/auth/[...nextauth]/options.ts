import prisma from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import InstagramProvider from "next-auth/providers/instagram"
import LinkedinProvider from "next-auth/providers/linkedin"

if (!process.env.NEXTAUTH_URL) {
    console.warn("Please set NEXTAUTH_URL environment variable");
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) throw new Error("Credentials not provided");
                const { identifier, password } = credentials;

                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { email: identifier },
                                { username: identifier },
                            ],
                        },
                    });

                    if (!user) throw new Error("No user found with this email or username");
                    if (!password) throw new Error("Password is required");

                    const isPasswordValid = await bcryptjs.compare(password, user.password);
                    if (!isPasswordValid) throw new Error("Invalid password");

                    return {
                        id: user.id,
                        email: user.email,
                        username: user.username || undefined,
                        image: user.image || undefined,
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    throw error;
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            authorization:{
                params:{
                    redirect_uri: 'http://localhost:3000/auth/x/callback'
                }
            }
        }),
        InstagramProvider({
            clientId: process.env.INSTAGRAM_CLIENT_ID!,
            clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!
        }),
        LinkedinProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID!,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
            authorization:{
                params:{
                    redirect_uri: 'http://localhost:3000/auth/linkedin/callback'
                },
                url: 'https://www.linkedin.com/oauth/v2/authorization'
            }
        })
    ],
    adapter: PrismaAdapter(prisma), // Use Prisma adapter for NextAuth
    callbacks: {
        async jwt({ token, user,account }) {
            if (account?.access_token) {
                token.accessToken = account.access_token;
            }
            if (account?.id_token) {
                token.idToken = account.id_token;
            }
            if (token?.iss) {
                delete token.iss;
            }
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.username = token.username as string;
                session.user.image = token.image as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/signin",
        error: "/sigin",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
};
