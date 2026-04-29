import { NextResponse } from "next/server";

import {
  canvasOAuthCompleteRequestSchema,
  mobileSessionSchema,
} from "@bettercanvas/shared";

import { connectCanvasIdentity } from "@/server/canvas/service";
import {
  exchangeCanvasOAuthCode,
  isCanvasOAuthConfigured,
  verifyCanvasOAuthState,
} from "@/server/canvas/oauth";
import { normalizeCanvasDomain } from "@/server/canvas/client";
import { issueMobileSessionToken } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "canvas-oauth-complete");
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: 10,
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

  if (!isCanvasOAuthConfigured()) {
    return NextResponse.json(
      { error: "Canvas OAuth is not configured on this server." },
      { status: 503 },
    );
  }

  try {
    const json = await request.json();
    const input = canvasOAuthCompleteRequestSchema.parse(json);
    const { domain: stateDomain } = await verifyCanvasOAuthState(input.state);
    const bodyDomain = normalizeCanvasDomain(input.domain);

    if (bodyDomain !== stateDomain) {
      return NextResponse.json(
        { error: "Canvas domain does not match the sign-in session." },
        { status: 400 },
      );
    }

    const accessToken = await exchangeCanvasOAuthCode(input.domain, input.code);
    const result = await connectCanvasIdentity({
      domain: input.domain,
      token: accessToken,
    });
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
            : "Unable to complete Canvas sign-in.",
      },
      { status: 400 },
    );
  }
}
