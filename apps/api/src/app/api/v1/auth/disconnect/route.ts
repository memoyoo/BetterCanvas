import { NextResponse } from "next/server";

import { disconnectCanvasAccount } from "@/server/canvas/service";
import { getMobileUserFromRequest } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "disconnect");
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimit.retryAfterMs ?? 60_000) / 1000),
          ),
        },
      },
    );
  }

  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectCanvasAccount(user.id);

  return NextResponse.json({ success: true });
}
