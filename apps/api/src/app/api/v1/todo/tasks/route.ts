import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrismaClient } from "@/lib/db";
import { getMobileUserFromRequest } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

const createTaskSchema = z.object({
  dueDate: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
  title: z.string().trim().min(1).max(160),
});

function parseDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T23:59:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, "todo-tasks-create");
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

  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const input = createTaskSchema.parse(body);
    const task = await getPrismaClient().task.create({
      data: {
        dueAt: parseDueDate(input.dueDate),
        notes: input.notes || null,
        title: input.title,
        userId: user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create that task.",
      },
      { status: 400 },
    );
  }
}
