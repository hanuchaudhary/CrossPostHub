import axios from "axios";

type Command = "INIT" | "APPEND" | "FINALIZE" | "STATUS";
interface TwitterMediaUploadProps {
    media: File;
    command: Command;
    total_bytes: string;
    media_type: string;
    accessToken: string;
}

// Step 1: Upload media to Twitter
//Required: media, media_type, total_bytes, command, AuthorizationToken
export async function twiiterMediaUpload({ accessToken, command, media}: TwitterMediaUploadProps) {
    try {
        const response = await axios.post("https://api.x.com/2/media/upload", {
            media
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data"
            },
            params: {
                media_type : media.type,
                command,
                total_bytes: media.size
            }
        })

        return response.data;

    } catch (error) {
        console.error("Twitter Media Upload Error:", error);
    }
}

export async function TwitterMediaUploadStatus({ accessToken, media_id }: { accessToken: string, media_id: string }) {
    try {
        const response = await axios.get("https://api.x.com/2/media/upload", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                command: "STATUS",
                media_id
            }
        })
        return response.data;
    } catch (error) {
        console.error("Twitter Media Upload Status Error:", error);
    }
}

export async function CreateTwitterPost({ accessToken, mediaIds, postText }: { accessToken: string, mediaIds: string[], postText: string }) {
    try {
        const response = await axios.post("https://api.x.com/2/tweets", {
            "media": {
                "media_ids": mediaIds,
            },
            "reply_settings": "following",
            "text": postText,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
    } catch (error) {

    }
}