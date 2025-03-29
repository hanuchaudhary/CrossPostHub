import { Redis } from "@upstash/redis";

// Create the Upstash Redis client
export const redis = new Redis({
  url: `https://${process.env.REDIS_HOST}`,
  token: process.env.REDIS_PASSWORD,
  retry: {
    retries: 3,
    backoff: (attempt) => Math.pow(2, attempt) * 1000,
  },
});

// Function to ensure the client is ready
export async function connectRedis() {
  try {
    await redis.ping();
    console.log("Upstash Redis ping successful");
    return redis;
  } catch (error) {
    console.error("Failed to connect to Upstash Redis:", error);
    throw error;
  }
}
