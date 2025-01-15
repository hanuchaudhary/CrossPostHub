import firebase from "@/lib/firebase";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        const { success, error } = registerSchema.safeParse({ email, password, name });
        if (!success) {
            return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        }

        const userCredentials = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const firebaseUser = userCredentials.user;
        if (!firebaseUser) {
            return NextResponse.json({ error: "User not created" }, { status: 500 });
        }

        const userExistInDB = await prisma.user.findUnique({
            where: {
                firebaseUid: firebaseUser.uid
            }
        });
        if (userExistInDB) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email,
                name,
                firebaseUid: firebaseUser.uid
            }
        });
        return NextResponse.json({ success: true, user });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

}