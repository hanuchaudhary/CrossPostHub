import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
    try {

        const { provider, providerAccountId } = await request.json();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const disconnectApp = await prisma.account.delete({
            where: {
                userId: session.user.id,
                provider_providerAccountId: {
                    provider,
                    providerAccountId
                }
            }
        })

        return NextResponse.json({ success: true, message: `Disconnected ${provider} account` }, { status: 200 });

    } catch (error) {
        console.error("Disconnect Error:", error);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}