import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id as string },
            select: {
                accounts: {
                    select: {
                        provider: true,
                        providerAccountId: true,
                        type: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                Plan: true,
                Post: true,
                planId: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });

    } catch (error) {
        console.error("Me Error:", error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}