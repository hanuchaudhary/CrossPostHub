import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            NextResponse.json({ error: "You are not authenticated" }, { status: 401 });
        }

        const connectedApps = await prisma.account.findMany({
            where: {
                userId: session?.user.id
            }
        })

        return NextResponse.json(connectedApps, { status: 200 });

    } catch (error) {
        console.error("Get Apps Error:", error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }

}