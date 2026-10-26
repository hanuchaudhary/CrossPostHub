import { Redis } from "@upstash/redis";

// Create the Upstash Redis client
export const redisClient = new Redis({
  url: `https://${process.env.REDIS_HOST}`,
  token: process.env.REDIS_PASSWORD,
  retry: {
    retries: 3,
    backoff: (attempt) => Math.pow(2, attempt) * 1000,
  },
});
