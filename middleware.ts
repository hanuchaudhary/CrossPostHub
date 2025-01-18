import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("Token:", token);
    
    const url = request.nextUrl.clone();

    // If user is not authenticated and accessing protected routes, redirect to signin
    // if (!token && url.pathname.startsWith("/dashboard")) {
    //     url.pathname = "/signin";
    //     return NextResponse.redirect(url);
    // }

    // If user is authenticated and tries to access auth-related pages, redirect to dashboard
    if (token && ["/signin", "/signup", "/"].includes(url.pathname)) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Allow other routes to pass through
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard", // Protect the dashboard route
        "/create", // Protect the create route
        "/signin", // Handle redirects for auth pages
        "/signup", // Handle redirects for auth pages
    ],
};
