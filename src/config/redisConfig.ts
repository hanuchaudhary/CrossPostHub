import { createClient } from "redis"

const redis = createClient({
    url: process.env.REDIS_URL
})

redis.on('error', (err) => {
    console.log('Redis error: ', err);
});

(async () => {
    await redis.connect();
    console.log('Redis connected');
})();

export { redis };