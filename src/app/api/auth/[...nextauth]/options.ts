import prisma from "@/config/prismaConfig";
import bcryptjs from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import InstagramProvider from "next-auth/providers/instagram";
import LinkedinProvider from "next-auth/providers/linkedin";
import { signinSchema } from "@/lib/validation";
import { getFreePlanId } from "@/utils/Controllers/GETFreePlan";
import { LINKEDIN_REDIRECT_URI } from "@/config";

if (!process.env.NEXTAUTH_URL) {
  console.warn("Please set NEXTAUTH_URL environment variable");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) throw new Error("Credentials not provided");
        const { email, password } = credentials;
        console.log("Credentials", credentials);

        const { success } = signinSchema.safeParse({ email, password });
        if (!success) throw new Error("Invalid credentials");

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: email,
            },
          });

          if (!user) throw new Error("No user found with this email address");
          if (!password) throw new Error("Password is required");
          if (!user.password)
            throw new Error(
              "This email is registered with a Google account, please sign in with Google"
            );

          const isPasswordValid = await bcryptjs.compare(
            password,
            user.password!
          );
          if (!isPasswordValid) throw new Error("Invalid password");

          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
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
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      version: "1.0A",
      authorization: {
        params: {
          redirect_uri: "http://localhost:3000/api/auth/callback/instagram",
        },
      },
      scope: "user_profile",
    }),
    LinkedinProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      issuer: "https://www.linkedin.com/oauth",
      authorization: {
        params: {
          redirect_uri: LINKEDIN_REDIRECT_URI,
          scope: "email profile w_member_social openid",
          prompt: "consent",
          response_type: "code",
        },
      },
      async profile(profile) {
        const id = profile.sub || profile.id || profile.email;
        return {
          id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma), // Use Prisma adapter for NextAuth
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        if (!user.email) throw new Error("Email is required");

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              planId: await getFreePlanId(),
            },
          });
          console.log("New user created");
        }

        if (account && existingUser) {
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
            },
            create: {
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
            },
          });

        }

        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
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
  debug: true,
};
