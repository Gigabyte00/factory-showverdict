const requests = new Map<string, number[]>();

let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;

  for (const [ip, timestamps] of requests) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      requests.delete(ip);
    } else {
      requests.set(ip, valid);
    }
  }
}

export function rateLimit(
  ip: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  cleanup(windowMs);

  const now = Date.now();
  const timestamps = (requests.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    return { allowed: false };
  }

  timestamps.push(now);
  requests.set(ip, timestamps);
  return { allowed: true };
}
