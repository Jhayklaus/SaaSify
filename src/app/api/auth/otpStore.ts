interface OTPEntry {
  code: string;
  expires: number;
  attempts: number;
}

export const otpStore = new Map<string, OTPEntry>();

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

export const requestRateMap = new Map<string, RateLimitEntry>();
export const verifyRateMap = new Map<string, RateLimitEntry>();

export function isRateLimited(
  map: Map<string, RateLimitEntry>,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (entry && now - entry.timestamp < windowMs) {
    if (entry.count >= limit) return true;
    entry.count += 1;
    map.set(key, entry);
    return false;
  }
  map.set(key, { count: 1, timestamp: now });
  return false;
}
