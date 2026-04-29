import { NextResponse } from "next/server";
import { z } from "zod";

import { getInboxConversationAssistView } from "@/server/canvas/view-models";
import { sendCanvasConversationReply } from "@/server/canvas/service";
import { getMobileUserFromRequest } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

type RouteProps = {
  params: Promise<{ conversationId: string }>;
};

const replySchema = z.object({
  message: z.string().trim().min(1).max(5000),
});

export async function GET(request: Request, { params }: RouteProps) {
  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  const conversation = await getInboxConversationAssistView(user.id, conversationId);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function POST(request: Request, { params }: RouteProps) {
  const rateLimitKey = getRateLimitKey(request, "inbox-reply");
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
    const input = replySchema.parse(body);
    const { conversationId } = await params;
    const result = await sendCanvasConversationReply({
      conversationId,
      message: input.message,
      userId: user.id,
    });

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send that message right now.",
      },
      { status: 400 },
    );
  }
}
