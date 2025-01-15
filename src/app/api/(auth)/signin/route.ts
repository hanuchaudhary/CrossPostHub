import { NextResponse } from "next/server";
import firebase from "@/lib/firebase"
import { signinSchema } from "@/lib/validation";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        const { success, error } = signinSchema.safeParse({ email, password });
        if (!success) {
            return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
        }

        const SigninUsingEmailAndPassword = firebase.auth().signInWithEmailAndPassword(email, password);
        return NextResponse.json({ success: true, SigninUsingEmailAndPassword });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}