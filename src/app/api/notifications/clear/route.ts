import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import prisma from "@/config/prismaConfig";

export async function PUT(request: NextRequest) {
        try {
            const session = await getServerSession(authOptions);
            if (!session || !session.user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const clearAllNotifications = await prisma.notification.deleteMany({
                where: { userId: session.user.id }
            });

            return NextResponse.json({ success: true });

        } catch (error : any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
}