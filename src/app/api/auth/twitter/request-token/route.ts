import OAuth from "oauth-1.0a"
import crypto from "crypto"
import axios from "axios"

const oauth = new OAuth({
    consumer: {
        key: process.env.TWITTER_CONSUMER_KEY as string,
        secret: process.env.TWITTER_CONSUMER_SECRET as string,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64")
    },
})

export async function GET() {
    const requestData = {
        url: "https://api.twitter.com/oauth/request_token",
        method: "POST",
        data: { oauth_callback: `${process.env.NEXTAUTH_URL}/api/auth/twitter/callback` },
    }

    try {
        console.log("Consumer Key:", process.env.TWITTER_CONSUMER_KEY)
        console.log("Consumer Secret:", process.env.TWITTER_CONSUMER_SECRET ? "[REDACTED]" : "NOT SET")
        console.log("Base URL:", process.env.NEXTAUTH_URL);

        const headers = oauth.toHeader(oauth.authorize(requestData))
        console.log("OAuth Headers:", headers)

        //@ts-ignore
        const response = await axios.post(requestData.url, null, { headers })

        console.log("Twitter API Response:", response.data)

        const { oauth_token } = Object.fromEntries(new URLSearchParams(response.data))

        return new Response(JSON.stringify({ oauth_token }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error: any) {
        console.error("Error details:", error)
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data)
            if (error.response?.status === 403) {
                return new Response(
                    JSON.stringify({
                        error: "Failed to get request token",
                        details: "Callback URL not approved. Please check your Twitter Developer App settings.",
                    }),
                    {
                        status: 403,
                        headers: { "Content-Type": "application/json" },
                    },
                )
            }
        }
        return new Response(JSON.stringify({ error: "Failed to get request token", details: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

