import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const oauth_token = searchParams.get("oauth_token")
  const oauth_verifier = searchParams.get("oauth_verifier")

  if (!oauth_token || !oauth_verifier) {
    return NextResponse.redirect("/login?error=Missing oauth_token or oauth_verifier")
  }

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/twitter/access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oauth_token, oauth_verifier }),
    })

    if (!response.ok) {
      throw new Error("Failed to get access token")
    }

    const data = await response.json()

    // Set the session token as an HTTP-only cookie
    const cookieOptions = `HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`
    const cookie = `sessionToken=${data.sessionToken}; ${cookieOptions}`

    // Redirect to the dashboard page with the user data
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`, {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  } catch (error) {
    console.error("Error in callback:", error)
    return NextResponse.redirect("/login?error=Failed to complete authentication")
  }
}

