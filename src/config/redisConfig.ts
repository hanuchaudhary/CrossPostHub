import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: `https://${process.env.REDIS_HOST}`,
  token: process.env.REDIS_PASSWORD,
  retry: {
    retries: 3,
    backoff: (attempt) => {
      return Math.pow(2, attempt) * 1000; // Exponential backoff
    },
  },
});
