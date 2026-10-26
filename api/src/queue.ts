import type { PrismaClient } from "../generated/prisma/client";
import { getDb } from "./lib/db";
import type { Bindings, PostJob } from "./types";

async function publishTwitter(
  accessToken: string,
  text: string,
  mediaKeys: string[],
) {
  if (mediaKeys.length)
    throw new Error(
      "Twitter media publishing requires an OAuth media-upload grant; reconnect the account after enabling it",
    );
  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok)
    throw new Error(`Twitter publish failed (${response.status})`);
  return response.json();
}

async function uploadLinkedInImage(
  accessToken: string,
  personId: string,
  data: ArrayBuffer,
  contentType: string,
) {
  const registered = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: `urn:li:person:${personId}`,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent",
            },
          ],
        },
      }),
    },
  );
  if (!registered.ok)
    throw new Error(
      `LinkedIn media registration failed (${registered.status})`,
    );
  const body = await registered.json<Record<string, any>>();
  const mechanism =
    body.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];
  const uploaded = await fetch(mechanism.uploadUrl, {
    method: "PUT",
    headers: { "content-type": contentType },
    body: data,
  });
  if (!uploaded.ok)
    throw new Error(`LinkedIn media upload failed (${uploaded.status})`);
  return body.value.asset as string;
}

async function publishLinkedIn(
  env: Bindings,
  accessToken: string,
  personId: string,
  text: string,
  mediaKeys: string[],
) {
  const assets = await Promise.all(
    mediaKeys.map(async (key) => {
      const object = await env.MEDIA_BUCKET.get(key);
      if (!object) throw new Error(`Media object not found: ${key}`);
      return uploadLinkedInImage(
        accessToken,
        personId,
        await object.arrayBuffer(),
        object.httpMetadata?.contentType || "image/jpeg",
      );
    }),
  );
  const media = assets.map((asset, index) => ({
    status: "READY",
    description: { text: `Image ${index + 1}` },
    media: asset,
    title: { text: `Image ${index + 1}` },
  }));
  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: assets.length ? "IMAGE" : "NONE",
          ...(assets.length ? { media } : {}),
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  if (!response.ok)
    throw new Error(`LinkedIn publish failed (${response.status})`);
  return response.json().catch(() => ({}));
}

async function processPost(db: PrismaClient, env: Bindings, job: PostJob) {
  const post = await db.post.findFirst({
    where: { id: job.postId, userId: job.userId },
  });
  if (!post || post.status === "SUCCESS") return;
  const account = await db.account.findFirst({
    where: { userId: job.userId, providerId: job.provider },
  });
  if (!account?.accessToken)
    throw new Error(`${job.provider} account is not connected`);
  if (job.provider === "twitter")
    await publishTwitter(account.accessToken, job.postText, job.mediaKeys);
  else if (job.provider === "linkedin")
    await publishLinkedIn(
      env,
      account.accessToken,
      account.accountId,
      job.postText,
      job.mediaKeys,
    );
  else throw new Error("Instagram publishing is not enabled yet");
  await db.$transaction([
    db.post.update({
      where: { id: job.postId },
      data: { status: "SUCCESS", provider: job.provider },
    }),
    db.notification.create({
      data: {
        userId: job.userId,
        type: "POST_STATUS_SUCCESS",
        message: `Your post has been published on ${job.provider}.`,
      },
    }),
  ]);
}

export async function consumePosts(
  batch: MessageBatch<PostJob>,
  env: Bindings,
) {
  const db = getDb(env.DATABASE_URL);
  await Promise.all(
    batch.messages.map(async (message) => {
      try {
        if (message.body.scheduledFor) {
          const remainingSeconds = Math.floor(
            (new Date(message.body.scheduledFor).getTime() - Date.now()) / 1000,
          );
          if (remainingSeconds > 0) {
            await env.POSTHUB_QUEUE.send(message.body, {
              delaySeconds: Math.min(43_200, remainingSeconds),
            });
            message.ack();
            return;
          }
        }
        await processPost(db, env, message.body);
        message.ack();
      } catch (error) {
        console.error("Post queue job failed", message.body.postId, error);
        if (message.attempts < 3) {
          message.retry({
            delaySeconds: Math.min(300, 10 * 2 ** message.attempts),
          });
          return;
        }
        await db.$transaction([
          db.post.update({
            where: { id: message.body.postId },
            data: { status: "FAILED" },
          }),
          db.notification.create({
            data: {
              userId: message.body.userId,
              type: "POST_STATUS_FAILED",
              message: `Your post failed to publish on ${message.body.provider}.`,
            },
          }),
        ]);
        message.ack();
      }
    }),
  );
}
