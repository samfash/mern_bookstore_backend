import Redis from "ioredis";
import logger from "../utils/logger";

export const redis = process.env.NODE_ENV === "test" ? null : new Redis();

// Cache middleware
export const cache = (req: any, res: any, next: any) => {
  if (!redis) return next();

  const key = req.originalUrl;
  redis.get(key, (err, data) => {
    if (err){
      logger.error("redis error:", err)
      return next();
    }

    if (data){
      logger.info("cache hit: ", key)
    return res.status(200).json(JSON.parse(data));
  }

  logger.info("cache miss: ", key)
    next();
  });
};
