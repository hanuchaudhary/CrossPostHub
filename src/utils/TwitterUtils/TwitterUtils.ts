import OAuth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";

interface uploadMediaToTwitterProps {
  media: any; // Expecting a Buffer or File
  oauth_token: string;
  oauth_token_secret: string;
}

export async function uploadMediaToTwitter({
  media,
  oauth_token,
  oauth_token_secret,
}: uploadMediaToTwitterProps) {
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

  const formData = new FormData();
  formData.append("media", media);

  const requestData = {
    url: "https://upload.twitter.com/1.1/media/upload.json",
    method: "POST",
  };

  const headers = oauth.toHeader(
    oauth.authorize(
      {
        url: requestData.url,
        method: requestData.method,
        data: {}, 
      },
      {
        key: oauth_token,
        secret: oauth_token_secret,
      }
    )
  );

  try {
    console.log("Uploading media to Twitter...");
    console.log("OAuth Headers:", headers.Authorization);

    const response = await axios.post(requestData.url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: headers.Authorization,
      },
    });

    console.log("Media uploaded to Twitter successfully");
    return response.data.media_id_string;
  } catch (error: any) {
    console.error("Error in uploadMediaToTwitter:", error.message);
    console.error("Media upload failed:", error.response?.data || error);
    return null;
  }
}


interface createTweetProps {
  text: string;
  mediaIds: string[];
  oauth_token: string;
  oauth_token_secret: string;
}

export async function createTweet({
  text,
  mediaIds,
  oauth_token,
  oauth_token_secret,
}: createTweetProps) {
  const oauth = new OAuth({
    consumer: {
      key: process.env.TWITTER_CONSUMER_KEY as string,
      secret: process.env.TWITTER_CONSUMER_SECRET as string,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
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

  if (!text && mediaIds.length === 0) {
    console.error("Text or media is required to create a tweet");
    return null;
  }

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
    console.log(error);
    console.error(
      "Tweet creation failed:",
      error.response?.data || error.message
    );
  }
}

export async function createtextTweet({
  text,
  oauth_token,
  oauth_token_secret,
}: {
  text: string;
  oauth_token: string;
  oauth_token_secret: string;
}) {
  const oauth = new OAuth({
    consumer: {
      key: process.env.TWITTER_CONSUMER_KEY as string,
      secret: process.env.TWITTER_CONSUMER_SECRET as string,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
    },
  });

  const requestData = {
    url: "https://api.twitter.com/2/tweets",
    method: "POST",
    data: {
      text,
    },
  };

  const headers = oauth.toHeader(
    oauth.authorize(
      {
        url: requestData.url,
        method: requestData.method,
        data: requestData.data,
      },
      {
        key: oauth_token,
        secret: oauth_token_secret,
      }
    )
  );

  try {
    console.log("Creating text tweet...");
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
    console.log("Text tweet created successfully");

    return response.data;
  } catch (error: any) {
    console.error(
      "Text tweet creation failed:",
      error.response?.data || error.message
    );
  }
}

export async function getTwitterUserDetails({
  oauth_token,
  oauth_token_secret,
}: {
  oauth_token: string;
  oauth_token_secret: string;
}) {
  const oauth = new OAuth({
    consumer: {
      key: process.env.TWITTER_CONSUMER_KEY as string,
      secret: process.env.TWITTER_CONSUMER_SECRET as string,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
    },
  });

  const requestData = {
    url: "https://api.twitter.com/1.1/account/verify_credentials.json",
    method: "GET",
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
    console.log("Getting Twitter user details...");
    const response = await axios.get(requestData.url, {
      headers: {
        Authorization: headers.Authorization,
      },
    });
    console.log("Twitter user details fetched successfully");
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to get Twitter user details:",
      error.response?.data || error.message
    );
  }
}
