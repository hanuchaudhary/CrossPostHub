// redisConfig.ts
import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    connectTimeout: 30000,
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
  },
});

async function connectRedis() {
  if (redis.isOpen) {
    console.log("Redis client is already connected");
    return redis;
  }

  try {
    await redis.connect();
    console.log("Redis client connected successfully");
    return redis;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
}

(async () => {
  await redis.connect();
  console.log("Redis connected");
})();

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redis.on("end", () => {
  console.log("Redis connection closed");
});

export { redis, connectRedis };
