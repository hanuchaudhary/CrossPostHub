import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();
        const { success, error } = registerSchema.safeParse({ email, password, name  });``
        
        if (!success) {
            return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        }

        const userExistWithEmail = await prisma.user.findFirst({ where: { email } });
        if (userExistWithEmail) { return NextResponse.json({ error: "User already exists with this email" }, { status: 400 }); }

        const userExistWithUsername = await prisma.user.findFirst({ where: { name } });
        if (userExistWithUsername) { return NextResponse.json({ error: "User already exists with this username" }, { status: 400 }); }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,   
            }
        });

        return NextResponse.json({ success: true, user });

    } catch (error: any) {
        console.log("Register Error:", error);
        return NextResponse.json({ error }, { status: 500 });
    }

}