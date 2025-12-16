import { randomBytes } from "node:crypto";

export function generateTrackingId(): string {
  // Short, URL-safe, reasonably unique.
  // Example: "Q1Z7K8M2P0"
  // base64url is available in modern Node.
  return randomBytes(12).toString("base64url").slice(0, 10).toUpperCase();
}
