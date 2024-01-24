import { kv } from "@vercel/kv";

const RATE_LIMIT: number = 1000;

/**
 * Returns the period where `time` belongs to.
 * Currently it is the utc date separated by '-' (no padding).
 *
 * For example: `2024-1-1`
 */
function getPeriodKey(time: Date): string {
  const year = time.getUTCFullYear();
  const month = time.getUTCMonth() + 1;
  const day = time.getUTCDate();
  const key = `${year}-${month}-${day}`;
  return key;
}

const SECONDS_OF_2_DAYS = 172800; /* 2 * 24 * 60 * 60 */

function getExpireTimestampInSeconds(time: Date): number {
  const startOfThePeriod = new Date(time);
  startOfThePeriod.setUTCHours(0, 0, 0, 0);

  const periodExpireSeconds = SECONDS_OF_2_DAYS;

  const expire =
    Math.ceil(startOfThePeriod.getTime() / 1000) + periodExpireSeconds;

  return expire;
}

export function checkRateLimitEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL);
}

export default async function incrementAndCheckRateLimit(
  repoId: string,
): Promise<
  | { rateLimitEnabled: false; exceeded?: undefined }
  | { rateLimitEnabled: true; exceeded: boolean }
> {
  if (!checkRateLimitEnabled()) {
    return { rateLimitEnabled: false };
  }

  const current = new Date();

  const currentPeriodKey = getPeriodKey(current);

  const key = `${currentPeriodKey}:${repoId}`;

  const currentRequests = await kv.incr(key);

  const exceeded = currentRequests > RATE_LIMIT;
  if (!exceeded) {
    const expire = getExpireTimestampInSeconds(current);
    await kv.expireat(key, expire);
  }

  return { rateLimitEnabled: true, exceeded };
}
