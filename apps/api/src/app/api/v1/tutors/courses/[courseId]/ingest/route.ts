import { NextResponse } from "next/server";

import { ingestTutorCourseContext } from "@/server/tutors/service";
import { getMobileUserFromRequest } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const rateLimitKey = getRateLimitKey(request, "tutor-ingest");
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

  const { courseId } = await params;
  const result = await ingestTutorCourseContext(user.id, courseId);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
