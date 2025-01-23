import OAuth from "oauth-1.0a"
import crypto from "crypto"
import axios from "axios"

interface uploadMediaToTwiiterProps {
    media: File;
    oauth_token: string;
    oauth_token_secret: string;
}

export async function uploadMediaToTwiiter({ media, oauth_token, oauth_token_secret }: uploadMediaToTwiiterProps) {

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

    const formData = new FormData();
    formData.append("media", media);

    const requestData = {
        url: "https://upload.twitter.com/1.1/media/upload.json",
        method: "POST",
        data: formData,
    }

    const headers = oauth.toHeader(
        oauth.authorize(requestData, {
            key: oauth_token,
            secret: oauth_token_secret,
        }),
    )

    try {
        console.log("Uploading media to Twitter...");
        const response = await axios.post("https://upload.twitter.com/1.1/media/upload.json", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: headers.Authorization,
            }
        });
        console.log("Media uploaded to Twitter successfully");
        return response.data.media_id_string;

    } catch (error: any) {
        console.log("Error in uploadMediaToTwiiter:", error.message);
        console.error("Media upload failed:", error);
        return

    }
}

interface createTweetProps {
    text: string;
    mediaIds: string[];
    oauth_token: string;
    oauth_token_secret: string;
}


export async function createTweet({ text, mediaIds, oauth_token, oauth_token_secret }: createTweetProps) {
    const oauth = new OAuth({
        consumer: {
            key: process.env.TWITTER_CONSUMER_KEY as string,
            secret: process.env.TWITTER_CONSUMER_SECRET as string,
        },
        signature_method: "HMAC-SHA1",
        hash_function(base_string, key) {
            return crypto.createHmac("sha1", key).update(base_string).digest("base64");
        },
    });

    const requestData = {
        url: "https://api.twitter.com/2/tweets",
        method: "POST",
        data: {
            text,
            ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } }),
        },
    };

    const headers = oauth.toHeader(
        oauth.authorize(
            {
                url: requestData.url,
                method: requestData.method,
            },
            {
                key: oauth_token,
                secret: oauth_token_secret,
            }
        )
    );

    try {
        console.log("Creating tweet...");
        const response = await axios.post(requestData.url, requestData.data, {
            headers: {
                Authorization: headers.Authorization,
                "Content-Type": "application/json",
                "User-Agent": "PostmanRuntime/7.43.0",
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
            },
        });
        console.log("Tweet created successfully");

        return response.data;
    } catch (error: any) {
        console.error("Tweet creation failed:", error.response?.data || error.message);
    }
}