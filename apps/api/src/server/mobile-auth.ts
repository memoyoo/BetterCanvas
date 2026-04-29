import "server-only";

import { SignJWT, jwtVerify } from "jose";

import { getAuthSecretKey } from "@/server/auth-secret";
import { getPrismaClient } from "@/lib/db";

type MobileTokenPayload = {
  displayName?: string | null;
  email?: string | null;
  sub: string;
  type: "mobile";
};

export async function issueMobileSessionToken(user: {
  displayName?: string | null;
  email?: string | null;
  id: string;
}) {
  return new SignJWT({
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    type: "mobile",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getAuthSecretKey());
}

export async function verifyMobileSessionToken(token: string) {
  const result = await jwtVerify(token, getAuthSecretKey());
  return result.payload as unknown as MobileTokenPayload;
}

export async function getMobileUserFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyMobileSessionToken(token);

    if (payload.type !== "mobile" || !payload.sub) {
      return null;
    }

    return getPrismaClient().user.findUnique({
      where: { id: payload.sub },
      include: { canvasAccount: true },
    });
  } catch {
    return null;
  }
}
