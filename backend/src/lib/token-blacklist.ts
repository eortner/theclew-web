/**
 * In-memory token blacklist.
 * Drop-in replacement: swap the Set for a Redis client call
 * when you move to multi-instance.
 */
const blacklist = new Set<string>();

export function blacklistToken(jti: string): void {
  blacklist.add(jti);
}

export function isBlacklisted(jti: string): boolean {
  return blacklist.has(jti);
}
