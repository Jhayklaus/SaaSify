import { NextResponse } from 'next/server';

const windowMs = 60 * 1000; // 1 minute
const limit = 10; // default limit per window

const store = new Map<string, { count: number; expires: number }>();

export function checkRateLimit(request: Request, routeOverride?: string) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const route = routeOverride ?? new URL(request.url).pathname;
  const key = `${ip}:${route}`;
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.expires < now) {
    store.set(key, { count: 1, expires: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

export function rateLimitResponse() {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
