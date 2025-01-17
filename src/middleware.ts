import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = getToken({ req: request, secret: process.env.SECRET });
    const url = request.nextUrl;

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

}

export const config = {
    matcher: ['/create', '/dashboard'],
};