import { NextResponse } from "next/server";
import { z } from "zod";

import { getMobileUserFromRequest } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";
import { submitTutorQuestion } from "@/server/tutors/service";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

const tutorMessageSchema = z.object({
  question: z.string().trim().min(1),
  threadId: z.string().trim().optional(),
});

export async function POST(request: Request, { params }: RouteProps) {
  const rateLimitKey = getRateLimitKey(request, "tutor-messages");
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: 12,
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

  try {
    const body = await request.json();
    const input = tutorMessageSchema.parse(body);
    const { courseId } = await params;
    const result = await submitTutorQuestion({
      courseId,
      question: input.question,
      threadId: input.threadId ?? null,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send that tutor question.",
      },
      { status: 400 },
    );
  }
}
