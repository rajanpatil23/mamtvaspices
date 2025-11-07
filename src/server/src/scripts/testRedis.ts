import redisClient from "../infra/cache/redis";

(async () => {
  try {
    console.log("Testing Redis ping...");
    const pong = await redisClient.ping();
    console.log("Redis ping reply:", pong);
    process.exit(0);
  } catch (err) {
    console.error("Redis error:", err);
    process.exit(1);
  }
})();
