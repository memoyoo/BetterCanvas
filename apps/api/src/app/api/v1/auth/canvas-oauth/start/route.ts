import { NextResponse } from "next/server";

import { canvasOAuthStartResponseSchema } from "@bettercanvas/shared";
import { z } from "zod";

import {
  buildCanvasAuthorizeUrl,
  createCanvasOAuthState,
  isCanvasOAuthConfigured,
} from "@/server/canvas/oauth";
import { normalizeCanvasDomain } from "@/server/canvas/client";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

const querySchema = z.object({
  domain: z.string().trim().min(1),
});

export async function GET(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "canvas-oauth-start");
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: 20,
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
    const url = new URL(request.url);
    const input = querySchema.parse({
      domain: url.searchParams.get("domain") ?? "",
    });
    normalizeCanvasDomain(input.domain);
    const state = await createCanvasOAuthState(input.domain);
    const authorizeUrl = buildCanvasAuthorizeUrl(input.domain, state);
    const body = canvasOAuthStartResponseSchema.parse({ authorizeUrl });

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Canvas sign-in.",
      },
      { status: 400 },
    );
  }
}
