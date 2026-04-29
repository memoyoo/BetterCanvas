import "server-only";

export function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET must be configured.");
  }

  return new TextEncoder().encode(secret);
}
