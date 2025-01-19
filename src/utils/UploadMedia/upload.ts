import axios from "axios";
type mediaType = "image" | "video/mp4" | "video";
type command = "INIT" | "APPEND" | "FINALIZE";

interface UploadToTwitterProps {
    media: string;
    media_type: mediaType;
    command: command;
    BearerToken: string;
}

export async function UploadMediaToTwitter({ media, media_type, command, BearerToken }: UploadToTwitterProps) {
    try {
        const result = await axios.post("https://api.twitter.com/2/media/upload", {
            media
        }, {
            headers: {
                Authorization: `Bearer ${BearerToken}`,
                "Content-Type": "multipart/form-data"
            },
            params: {
                media_type,
                command
            },
        })

        return result.data;
    } catch (error) {
        console.error("Upload Error:", error);
        return error;
    }

}

export async function TwitterMediaStatus(mediaId: string, BearerToken: string) {
    try {
        const result = await axios.get(`https://api.x.com/2/media/upload?command=STATUS&media_id=${mediaId}`, {
            headers: {
                Authorization: `Bearer ${BearerToken}`
            }
        })

        return result.data;
    } catch (error) {
        console.error("Media Status Error:", error);
        return error;
    }
}

export async function UploadMediaToLinkedin() {
    
}