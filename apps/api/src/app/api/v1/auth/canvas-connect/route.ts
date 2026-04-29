import { NextResponse } from "next/server";

import {
  canvasConnectRequestSchema,
  mobileSessionSchema,
} from "@bettercanvas/shared";

import { connectCanvasIdentity } from "@/server/canvas/service";
import { issueMobileSessionToken } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "canvas-connect");
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

  try {
    const body = await request.json();
    const input = canvasConnectRequestSchema.parse(body);
    const result = await connectCanvasIdentity(input);
    const session = {
      token: await issueMobileSessionToken(result.user),
      user: {
        displayName: result.user.displayName ?? null,
        email: result.user.email ?? null,
        id: result.user.id,
      },
    };

    return NextResponse.json(mobileSessionSchema.parse(session));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect BetterCanvas to Canvas.",
      },
      { status: 400 },
    );
  }
}
