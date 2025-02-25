import Redis from "ioredis";

export const redis = new Redis();

// Utility function to delete keys by pattern
export const deleteKeysByPattern = async (pattern: string): Promise<void> => {
  const stream = redis.scanStream({
    match: pattern, // Match all keys starting with the prefix
    count: 100, // Process 100 keys at a time (adjustable)
  });

  const pipeline = redis.pipeline();
  stream.on("data", (keys: string[]) => {
    if (keys.length > 0) {
      keys.forEach((key) => pipeline.del(key)); // Add delete commands to the pipeline
    }
  });

  return new Promise((resolve, reject) => {
    stream.on("end", async () => {
      await pipeline.exec(); // Execute pipeline when scan is complete
      resolve();
    });
    stream.on("error", (err) => reject(err));
  });
};
