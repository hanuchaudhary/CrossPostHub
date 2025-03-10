import { createClient } from "redis"

const redis = createClient({
    url: process.env.REDIS_URL
})

redis.on('error', (err) => console.error('Redis Error:', err));

(async () => {
    await redis.connect();
    console.log('Redis connected');
})();

export { redis };

// import Redis from "ioredis";

// if (!process.env.REDIS_HOST) {
//   throw new Error("REDIS_HOST is not provided");
// }

// if (!process.env.REDIS_PORT) {
//   throw new Error("REDIS_PORT is not provided");
// }

// // if (!process.env.REDIS_PASSWORD) {
// //   throw new Error("REDIS_PASSWORD is not provided");
// // }

// const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: parseInt(process.env.REDIS_PORT!),
//   // password: process.env.REDIS_PASSWORD,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000); // Exponential backoff, max 2 seconds
//     return delay;
//   },
// });

// redis.on("error", (err) => console.error("Redis Error:", err));
// redis.on("connect", () => console.log("Redis connected"));
// redis.on("close", () => console.log("Redis connection closed"));
// redis.on("end", () => console.log("Redis connection ended"));

// /**
//  * Rate limit a user's requests.
//  * @param userId - The user ID to rate limit.
//  * @param limit - Maximum number of requests allowed in the time window.
//  * @param windowInSeconds - Time window in seconds.
//  * @returns True if the request is allowed, false if rate-limited.
//  */

// export const rateLimit = async (
//   userId: string,
//   limit: number,
//   windowInSeconds: number
// ): Promise<boolean> => {
//   const key = `my_app:rate_limit:${userId}`;
//   const currentRequests = await redis.incr(key);

//   if (currentRequests === 1) {
//     await redis.expire(key, windowInSeconds);
//     console.log(
//       `Rate limit set for user ${userId}: ${limit} requests per ${windowInSeconds} seconds`
//     );
//   }

//   const isAllowed = currentRequests <= limit;
//   if (!isAllowed) {
//     console.log(`Rate limit exceeded for user ${userId}`);
//   }

//   return isAllowed;
// };

// export { redis };
