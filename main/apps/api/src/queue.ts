import {
  CrossPostHub,
  InstagramProvider,
  LinkedInProvider,
  TwitterProvider,
  PublishError,
} from "./core";
import type { PrismaClient } from "../generated/prisma/client";
import { getDb } from "./lib/db";
import { getPublishingAccount } from "./lib/publishing-account";
import type { Bindings, PostJob } from "./types";

const crossposthub = new CrossPostHub([
  new TwitterProvider(),
  new LinkedInProvider(),
  new InstagramProvider(),
]);

async function processPost(db: PrismaClient, env: Bindings, job: PostJob) {
  const post = await db.post.findFirst({
    where: { id: job.postId, userId: job.userId },
  });
  if (!post || post.status === "SUCCESS") return;

  const account = await getPublishingAccount(db, env, job);
  
  await crossposthub.publish({
    provider: job.provider,
    account,
    text: job.postText,
    media: job.mediaKeys.map((key) => ({
      async open() {
        if (!key.startsWith(`media/${job.userId}/`)) throw new PublishError("Invalid media key for post owner");
        const object = await env.MEDIA_BUCKET.get(key);
        if (!object) throw new PublishError(`Media object not found: ${key}`);
        return { stream: object.body, size: object.size, contentType: object.httpMetadata?.contentType || "application/octet-stream" };
      },
      async getPublicUrl() {
        if (!key.startsWith(`media/${job.userId}/`)) throw new PublishError("Invalid media key for post owner");
        if (!env.R2_PUBLIC_URL)
          throw new Error("R2_PUBLIC_URL is required for Instagram publishing");
        const object = await env.MEDIA_BUCKET.head(key);
        if (!object) throw new Error(`Media object not found: ${key}`);
        return {
          url: `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`,
          contentType:
            object.httpMetadata?.contentType || "application/octet-stream",
        };
      },
      async load() {
        if (!key.startsWith(`media/${job.userId}/`)) throw new PublishError("Invalid media key for post owner");
        const object = await env.MEDIA_BUCKET.get(key);
        if (!object) throw new Error(`Media object not found: ${key}`);
        return {
          data: await object.arrayBuffer(),
          contentType: object.httpMetadata?.contentType || "image/jpeg",
        };
      },
    })),
  });
  await Promise.all([
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
  const db = getDb(env.DB);
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
        if (message.attempts < 3 && (!(error instanceof PublishError) || error.retryable)) {
          message.retry({
            delaySeconds: Math.min(43_200, error instanceof PublishError && error.retryAfterSeconds !== undefined ? Math.max(1, error.retryAfterSeconds) : Math.min(300, 10 * 2 ** message.attempts)),
          });
          return;
        }
        await Promise.all([
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
