import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RateLimitError } from "./errors";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
      })
    : null;

/**
 * Helper to apply rate limiting in API routes.
 * No-ops when Upstash Redis is not configured (local dev).
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimit) return { limit: 10, reset: 0, remaining: 10 };
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  if (!success) throw new RateLimitError();
  return { limit, reset, remaining };
}
