import { NextResponse } from "next/server";

import {
  canvasSyncConfigured,
  getCanvasSyncSetupIssues,
  syncAllCanvasAccounts,
} from "@/server/canvas/service";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "cron-sync");
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: 3,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
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

  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      {
        error: "CRON_SECRET is not configured.",
      },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (bearerToken !== expectedSecret) {
    return unauthorizedResponse();
  }

  if (!canvasSyncConfigured) {
    return NextResponse.json(
      {
        error: "Canvas sync is not configured.",
        issues: getCanvasSyncSetupIssues(),
      },
      { status: 503 },
    );
  }

  const result = await syncAllCanvasAccounts();

  return NextResponse.json({
    ...result,
    ranAt: new Date().toISOString(),
  });
}
