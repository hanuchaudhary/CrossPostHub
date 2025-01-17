import prisma from "@/lib/prisma"
import NextAuth, { AuthOptions, NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcryptjs from 'bcryptjs'


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'Credentials',
            name: 'Credentials',
            credentials: {
                identifier: { label: "identifier", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    const user = await prisma.user.findFirst({
                        where: {
                            OR: [{ email: credentials?.identifier },
                            { username: credentials?.identifier }
                            ]
                        }
                    }) as { id: string; email: string; password: string; username: string | undefined; image: string | undefined; createdAt: Date; updatedAt: Date } | null

                    if (!user) { throw new Error('No user found') }

                    if (!credentials?.password) { throw new Error('Password is required') }

                    const unhashedPassword = await bcryptjs.compare(credentials.password, user.password);
                    if (!unhashedPassword) { throw new Error('Password is incorrect') }

                    return user;
                } catch (error: any) {
                    throw new Error(error.message)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (token) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, user }) {
            if (session) {
                session.user.id = user.id;
                session.user.email = user.email;
                session.user.username = user.username
                session.user.image = user.image;
            }
            return session;
        }
    }
    ,
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}