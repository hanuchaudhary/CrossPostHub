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

redis.on("error", (err) => console.error("Redis error:", err));

(async () => {
  await redis.connect();
  console.log("Redis connected");
})();

export { redis };