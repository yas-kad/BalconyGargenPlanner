import "server-only";
import { createHmac } from "node:crypto";

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/** Raw IPs are never stored; a keyed hash is enough to rate limit. */
export function hashIp(ip: string): string {
  return createHmac("sha256", process.env.IP_HASH_SALT ?? "balcony-garden-planner")
    .update(ip)
    .digest("hex");
}
