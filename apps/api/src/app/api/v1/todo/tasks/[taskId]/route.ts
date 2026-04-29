import { NextResponse } from "next/server";
import { z } from "zod";

import { getPrismaClient } from "@/lib/db";
import { getMobileUserFromRequest } from "@/server/mobile-auth";
import { checkRateLimit, getRateLimitKey } from "@/server/rate-limit";

type RouteProps = {
  params: Promise<{ taskId: string }>;
};

const updateTaskSchema = z.object({
  completed: z.boolean().optional(),
  dueDate: z.string().trim().optional(),
  notes: z.string().trim().max(2000).optional(),
  title: z.string().trim().min(1).max(160).optional(),
});

function parseDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T23:59:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function getOwnedTask(taskId: string, userId: string) {
  return getPrismaClient().task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const rateLimitKey = getRateLimitKey(request, "todo-tasks-update");
  const rateLimit = checkRateLimit(rateLimitKey, {
    maxRequests: 30,
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

  const { taskId } = await params;
  const task = await getOwnedTask(taskId, user.id);

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const input = updateTaskSchema.parse(body);
    const updated = await getPrismaClient().task.update({
      where: { id: task.id },
      data: {
        completed: input.completed ?? task.completed,
        dueAt:
          input.dueDate !== undefined ? parseDueDate(input.dueDate) : task.dueAt,
        notes: input.notes !== undefined ? input.notes || null : task.notes,
        title: input.title ?? task.title,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update that task.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const rateLimitKey = getRateLimitKey(request, "todo-tasks-delete");
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

  const { taskId } = await params;
  const task = await getOwnedTask(taskId, user.id);

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await getPrismaClient().task.delete({
    where: { id: task.id },
  });

  return NextResponse.json({ success: true });
}
