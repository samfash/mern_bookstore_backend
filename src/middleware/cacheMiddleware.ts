import Redis from "ioredis";

export const redis = process.env.NODE_ENV === "test" ? null : new Redis();

// Cache middleware
export const cache = (req: any, res: any, next: any) => {
  if (!redis) return next();

  const key = req.originalUrl;
  redis.get(key, (err, data) => {
    if (err) return next();
    if (data) return res.status(200).json(JSON.parse(data));
    next();
  });
};
