import { getPrismaClient } from "@/lib/db";
import {
  addCanvasConversationMessage,
  getCanvasConversation,
  getCanvasFriendlyError,
  getCanvasInitialSyncSnapshot,
  normalizeCanvasDomain,
} from "@/server/canvas/client";
import {
  decryptCanvasToken,
  encryptCanvasToken,
  tokenEncryptionConfigured,
} from "@/server/canvas/crypto";
import type {
  CanvasAssignment,
  CanvasConversation,
  CanvasInitialSyncSnapshot,
  CanvasPlannerItem,
  CanvasUpcomingEvent,
} from "@/server/canvas/types";

type ConnectCanvasAccountInput = {
  userId: string;
  domain: string;
  token: string;
};

function parseOptionalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseCourseCanvasIdFromContextCode(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^course_(\d+)$/i);

  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function getAssignmentHasSubmitted(assignment: CanvasAssignment) {
  if (!assignment.submission) {
    return false;
  }

  if (assignment.submission.excused) {
    return true;
  }

  if (assignment.submission.submitted_at) {
    return true;
  }

  if (assignment.submission.workflow_state) {
    return assignment.submission.workflow_state !== "unsubmitted";
  }

  return false;
}

function getPlannerItemId(item: CanvasPlannerItem) {
  const parsed = Number(item.plannable_id);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPlannerItemType(item: CanvasPlannerItem) {
  return item.plannable_type?.trim().toLowerCase() || "unknown";
}

function getPlannerItemTitle(item: CanvasPlannerItem) {
  return (
    item.plannable?.title?.trim() ||
    item.plannable?.name?.trim() ||
    "Untitled planner item"
  );
}

function getPlannerItemDueAt(item: CanvasPlannerItem) {
  return parseOptionalDate(item.plannable?.due_at ?? item.plannable?.todo_date ?? null);
}

function isPlannerItemCompleted(item: CanvasPlannerItem) {
  if (item.planner_override?.marked_complete) {
    return true;
  }

  if (item.submissions && typeof item.submissions === "object") {
    return Boolean(
      item.submissions.submitted ||
        item.submissions.excused ||
        item.submissions.graded,
    );
  }

  return false;
}

function getConversationParticipants(conversation: CanvasConversation) {
  if (!Array.isArray(conversation.participants)) {
    return [];
  }

  return conversation.participants.map((participant) => ({
    id: participant.id,
    name:
      participant.full_name?.trim() ||
      participant.name?.trim() ||
      `Canvas user ${participant.id}`,
  }));
}

function isConversationUnread(conversation: CanvasConversation) {
  return conversation.workflow_state?.toLowerCase() === "unread";
}

function getConversationSubject(conversation: CanvasConversation) {
  return conversation.subject?.trim() || "Untitled conversation";
}

function getCalendarEventCourseCanvasId(event: CanvasUpcomingEvent) {
  return (
    event.assignment?.course_id ??
    parseCourseCanvasIdFromContextCode(event.context_code) ??
    null
  );
}

function getCalendarEventTitle(event: CanvasUpcomingEvent) {
  return event.assignment?.name?.trim() || event.title?.trim() || "Untitled event";
}

function getCalendarEventType(event: CanvasUpcomingEvent) {
  return event.assignment ? "assignment" : "event";
}

function getCalendarEventStartAt(event: CanvasUpcomingEvent) {
  return (
    parseOptionalDate(event.start_at) ??
    parseOptionalDate(event.assignment?.due_at) ??
    parseOptionalDate(
      event.all_day_date ? `${event.all_day_date}T00:00:00` : null,
    )
  );
}

function getCalendarEventEndAt(event: CanvasUpcomingEvent) {
  return (
    parseOptionalDate(event.end_at) ??
    parseOptionalDate(event.assignment?.due_at) ??
    getCalendarEventStartAt(event)
  );
}

function getCanvasSyncSetupIssues() {
  const issues: string[] = [];

  if (!process.env.DATABASE_URL) {
    issues.push("DATABASE_URL");
  }

  if (!tokenEncryptionConfigured) {
    issues.push("TOKEN_ENC_KEY");
  }

  return issues;
}

function requireCanvasSyncSetup() {
  const issues = getCanvasSyncSetupIssues();

  if (issues.length > 0) {
    throw new Error(
      `Canvas sync is not ready yet. Add ${issues.join(" and ")} to continue.`,
    );
  }
}

function toBytes(value: Buffer | Uint8Array) {
  return Uint8Array.from(value);
}

function getCanvasDisplayName(snapshot: CanvasInitialSyncSnapshot) {
  return (
    snapshot.user.short_name?.trim() ||
    snapshot.user.name?.trim() ||
    snapshot.user.sortable_name?.trim() ||
    null
  );
}

async function saveCanvasSnapshot(
  userId: string,
  domain: string,
  token: string,
  snapshot: CanvasInitialSyncSnapshot,
) {
  const prisma = getPrismaClient();
  const encryptedToken = encryptCanvasToken(token);
  const syncedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const account = await tx.canvasAccount.upsert({
      where: { userId },
      update: {
        authTag: toBytes(encryptedToken.authTag),
        canvasUserId: snapshot.user.id,
        domain,
        encryptedToken: toBytes(encryptedToken.encryptedToken),
        iv: toBytes(encryptedToken.iv),
        label:
          snapshot.user.short_name?.trim() ||
          snapshot.user.name?.trim() ||
          snapshot.user.sortable_name?.trim() ||
          null,
        lastSyncedAt: syncedAt,
      },
      create: {
        authTag: toBytes(encryptedToken.authTag),
        canvasUserId: snapshot.user.id,
        domain,
        encryptedToken: toBytes(encryptedToken.encryptedToken),
        iv: toBytes(encryptedToken.iv),
        label:
          snapshot.user.short_name?.trim() ||
          snapshot.user.name?.trim() ||
          snapshot.user.sortable_name?.trim() ||
          null,
        lastSyncedAt: syncedAt,
        userId,
      },
    });

    const displayName = getCanvasDisplayName(snapshot);

    if (displayName) {
      await tx.user.update({
        where: { id: userId },
        data: {
          displayName,
        },
      });
    }

    const courseIdByCanvasId = new Map<number, string>();

    for (const course of snapshot.courses) {
      const savedCourse = await tx.course.upsert({
        where: {
          canvasAccountId_canvasId: {
            canvasAccountId: account.id,
            canvasId: course.id,
          },
        },
        update: {
          color: course.color ?? null,
          courseCode: course.course_code ?? null,
          endAt: parseOptionalDate(course.end_at),
          enrollmentState: course.enrollment_state ?? course.workflow_state ?? null,
          lastSyncedAt: syncedAt,
          name: course.name,
          startAt: parseOptionalDate(course.start_at),
          term: course.term?.name ?? null,
        },
        create: {
          canvasAccountId: account.id,
          canvasId: course.id,
          color: course.color ?? null,
          courseCode: course.course_code ?? null,
          endAt: parseOptionalDate(course.end_at),
          enrollmentState: course.enrollment_state ?? course.workflow_state ?? null,
          lastSyncedAt: syncedAt,
          name: course.name,
          startAt: parseOptionalDate(course.start_at),
          term: course.term?.name ?? null,
        },
      });

      courseIdByCanvasId.set(course.id, savedCourse.id);
    }

    for (const assignment of snapshot.assignments) {
      const courseId = courseIdByCanvasId.get(assignment.course_id);

      if (!courseId) {
        continue;
      }

      await tx.assignment.upsert({
        where: {
          courseId_canvasId: {
            courseId,
            canvasId: assignment.id,
          },
        },
        update: {
          dueAt: parseOptionalDate(assignment.due_at),
          hasSubmitted: getAssignmentHasSubmitted(assignment),
          htmlUrl: assignment.html_url ?? "",
          name: assignment.name,
          pointsPossible: assignment.points_possible ?? null,
          score: assignment.submission?.score ?? null,
          submissionTypes: assignment.submission_types ?? [],
        },
        create: {
          courseId,
          dueAt: parseOptionalDate(assignment.due_at),
          hasSubmitted: getAssignmentHasSubmitted(assignment),
          htmlUrl: assignment.html_url ?? "",
          name: assignment.name,
          pointsPossible: assignment.points_possible ?? null,
          score: assignment.submission?.score ?? null,
          submissionTypes: assignment.submission_types ?? [],
          canvasId: assignment.id,
        },
      });
    }

    for (const item of snapshot.plannerItems) {
      const plannableId = getPlannerItemId(item);

      if (plannableId === null) {
        continue;
      }

      await tx.plannerItem.upsert({
        where: {
          canvasAccountId_plannableType_plannableId: {
            canvasAccountId: account.id,
            plannableId,
            plannableType: getPlannerItemType(item),
          },
        },
        update: {
          completed: isPlannerItemCompleted(item),
          courseCanvasId: item.course_id ?? null,
          dueAt: getPlannerItemDueAt(item),
          htmlUrl: item.html_url ?? item.plannable?.html_url ?? null,
          title: getPlannerItemTitle(item),
        },
        create: {
          canvasAccountId: account.id,
          completed: isPlannerItemCompleted(item),
          courseCanvasId: item.course_id ?? null,
          dueAt: getPlannerItemDueAt(item),
          htmlUrl: item.html_url ?? item.plannable?.html_url ?? null,
          plannableId,
          plannableType: getPlannerItemType(item),
          title: getPlannerItemTitle(item),
        },
      });
    }

    for (const item of snapshot.activityItems.slice(0, 100)) {
      await tx.activityItem.upsert({
        where: {
          canvasAccountId_canvasId: {
            canvasAccountId: account.id,
            canvasId: String(item.id),
          },
        },
        update: {
          courseId:
            item.course_id !== null && item.course_id !== undefined
              ? (courseIdByCanvasId.get(item.course_id) ?? null)
              : null,
          createdAt: parseOptionalDate(item.created_at) ?? syncedAt,
          htmlUrl: item.html_url ?? null,
          message: item.message ?? null,
          title: item.title,
          type: item.type,
        },
        create: {
          canvasAccountId: account.id,
          canvasId: String(item.id),
          courseId:
            item.course_id !== null && item.course_id !== undefined
              ? (courseIdByCanvasId.get(item.course_id) ?? null)
              : null,
          createdAt: parseOptionalDate(item.created_at) ?? syncedAt,
          htmlUrl: item.html_url ?? null,
          message: item.message ?? null,
          title: item.title,
          type: item.type,
        },
      });
    }

    for (const event of snapshot.calendarEvents) {
      const startAt = getCalendarEventStartAt(event);

      if (!startAt) {
        continue;
      }

      const courseCanvasId = getCalendarEventCourseCanvasId(event);

      await tx.calendarEvent.upsert({
        where: {
          canvasAccountId_canvasId: {
            canvasAccountId: account.id,
            canvasId: String(event.id),
          },
        },
        update: {
          allDay: Boolean(event.all_day),
          courseId:
            courseCanvasId !== null
              ? (courseIdByCanvasId.get(courseCanvasId) ?? null)
              : null,
          endAt: getCalendarEventEndAt(event),
          htmlUrl: event.html_url ?? event.assignment?.html_url ?? null,
          startAt,
          title: getCalendarEventTitle(event),
          type: getCalendarEventType(event),
        },
        create: {
          allDay: Boolean(event.all_day),
          canvasAccountId: account.id,
          canvasId: String(event.id),
          courseId:
            courseCanvasId !== null
              ? (courseIdByCanvasId.get(courseCanvasId) ?? null)
              : null,
          endAt: getCalendarEventEndAt(event),
          htmlUrl: event.html_url ?? event.assignment?.html_url ?? null,
          startAt,
          title: getCalendarEventTitle(event),
          type: getCalendarEventType(event),
        },
      });
    }

    for (const conversation of snapshot.conversations.slice(0, 100)) {
      await tx.conversation.upsert({
        where: {
          canvasAccountId_canvasId: {
            canvasAccountId: account.id,
            canvasId: conversation.id,
          },
        },
        update: {
          lastMessageAt:
            parseOptionalDate(conversation.last_message_at) ?? syncedAt,
          participants: getConversationParticipants(conversation),
          starred: Boolean(conversation.starred),
          subject: getConversationSubject(conversation),
          unread: isConversationUnread(conversation),
        },
        create: {
          canvasAccountId: account.id,
          canvasId: conversation.id,
          lastMessageAt:
            parseOptionalDate(conversation.last_message_at) ?? syncedAt,
          participants: getConversationParticipants(conversation),
          starred: Boolean(conversation.starred),
          subject: getConversationSubject(conversation),
          unread: isConversationUnread(conversation),
        },
      });
    }

    return {
      accountId: account.id,
      syncedAt,
      counts: {
        activityItems: snapshot.activityItems.length,
        assignments: snapshot.assignments.length,
        calendarEvents: snapshot.calendarEvents.length,
        conversations: snapshot.conversations.length,
        courses: snapshot.courses.length,
        plannerItems: snapshot.plannerItems.length,
      },
    };
  });
}

export const canvasSyncConfigured = getCanvasSyncSetupIssues().length === 0;

export { getCanvasSyncSetupIssues };

export async function connectCanvasIdentity(input: {
  domain: string;
  token: string;
}) {
  requireCanvasSyncSetup();

  const token = input.token.trim();

  if (!token) {
    throw new Error("Paste your Canvas access token to continue.");
  }

  try {
    const domain = normalizeCanvasDomain(input.domain);
    const snapshot = await getCanvasInitialSyncSnapshot(domain, token);
    const prisma = getPrismaClient();
    const existingAccount = await prisma.canvasAccount.findFirst({
      where: {
        canvasUserId: snapshot.user.id,
        domain,
      },
      include: {
        user: true,
      },
    });
    const user =
      existingAccount?.user ??
      (await prisma.user.create({
        data: {
          displayName: getCanvasDisplayName(snapshot),
          email: snapshot.user.primary_email ?? null,
          name: snapshot.user.name,
        },
      }));
    const syncResult = await saveCanvasSnapshot(user.id, domain, token, snapshot);
    const syncedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        canvasAccount: true,
      },
    });

    return {
      syncResult,
      user: syncedUser ?? user,
    };
  } catch (error) {
    throw new Error(getCanvasFriendlyError(error));
  }
}

export async function connectCanvasAccount(input: ConnectCanvasAccountInput) {
  requireCanvasSyncSetup();

  const token = input.token.trim();

  if (!token) {
    throw new Error("Paste your Canvas access token to continue.");
  }

  try {
    const domain = normalizeCanvasDomain(input.domain);
    const snapshot = await getCanvasInitialSyncSnapshot(domain, token);

    return saveCanvasSnapshot(input.userId, domain, token, snapshot);
  } catch (error) {
    throw new Error(getCanvasFriendlyError(error));
  }
}

export async function syncCanvasAccount(userId: string) {
  requireCanvasSyncSetup();

  const prisma = getPrismaClient();
  const account = await prisma.canvasAccount.findUnique({
    where: { userId },
  });

  if (!account) {
    throw new Error("Connect a Canvas account before syncing.");
  }

  try {
    const token = decryptCanvasToken({
      authTag: account.authTag,
      encryptedToken: account.encryptedToken,
      iv: account.iv,
    });
    const snapshot = await getCanvasInitialSyncSnapshot(account.domain, token);

    return saveCanvasSnapshot(userId, account.domain, token, snapshot);
  } catch (error) {
    throw new Error(getCanvasFriendlyError(error));
  }
}

export async function syncAllCanvasAccounts() {
  requireCanvasSyncSetup();

  const prisma = getPrismaClient();
  const accounts = await prisma.canvasAccount.findMany({
    select: {
      id: true,
      userId: true,
    },
  });
  const results: Array<{
    accountId: string;
    counts?: {
      activityItems: number;
      assignments: number;
      calendarEvents: number;
      conversations: number;
      courses: number;
      plannerItems: number;
    };
    error?: string;
    syncedAt?: Date;
    userId: string;
  }> = [];

  for (const account of accounts) {
    try {
      const result = await syncCanvasAccount(account.userId);
      results.push({
        accountId: account.id,
        counts: result.counts,
        syncedAt: result.syncedAt,
        userId: account.userId,
      });
    } catch (error) {
      results.push({
        accountId: account.id,
        error:
          error instanceof Error
            ? error.message
            : "Canvas sync failed for this account.",
        userId: account.userId,
      });
    }
  }

  return {
    accountCount: accounts.length,
    results,
    successCount: results.filter((result) => !result.error).length,
    failureCount: results.filter((result) => Boolean(result.error)).length,
  };
}

export async function disconnectCanvasAccount(userId: string) {
  return getPrismaClient().canvasAccount.deleteMany({
    where: { userId },
  });
}

async function getCanvasConversationAccess(userId: string, conversationId: string) {
  const prisma = getPrismaClient();
  const [account, conversation] = await Promise.all([
    prisma.canvasAccount.findUnique({
      where: { userId },
    }),
    prisma.conversation.findFirst({
      where: {
        canvasAccount: {
          userId,
        },
        id: conversationId,
      },
    }),
  ]);

  if (!account || !conversation) {
    return null;
  }

  const token = decryptCanvasToken({
    authTag: account.authTag,
    encryptedToken: account.encryptedToken,
    iv: account.iv,
  });

  return {
    account,
    conversation,
    token,
  };
}

function normalizeConversationReply(value: string) {
  const reply = value.trim();

  if (!reply) {
    throw new Error("Reply body cannot be empty.");
  }

  if (reply.length > 5000) {
    throw new Error("Reply is too long. Keep it under 5000 characters.");
  }

  return reply;
}

export async function getCanvasConversationThread(
  userId: string,
  conversationId: string,
) {
  requireCanvasSyncSetup();

  const access = await getCanvasConversationAccess(userId, conversationId);

  if (!access) {
    return null;
  }

  const { account, conversation, token } = access;

  try {
    return {
      account,
      conversation,
      detail: await getCanvasConversation(account.domain, token, conversation.canvasId),
    };
  } catch (error) {
    throw new Error(getCanvasFriendlyError(error));
  }
}

export async function sendCanvasConversationReply(input: {
  conversationId: string;
  message: string;
  userId: string;
}) {
  requireCanvasSyncSetup();

  const access = await getCanvasConversationAccess(input.userId, input.conversationId);

  if (!access) {
    return null;
  }

  const { account, conversation, token } = access;
  const message = normalizeConversationReply(input.message);

  try {
    const updatedConversation = await addCanvasConversationMessage(
      account.domain,
      token,
      conversation.canvasId,
      message,
    );
    const participants = getConversationParticipants(updatedConversation);
    const parsedLastMessageAt = parseOptionalDate(
      updatedConversation.last_message_at,
    );

    await getPrismaClient().conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        lastMessageAt: parsedLastMessageAt ?? new Date(),
        participants: participants.length > 0 ? participants : undefined,
        subject: updatedConversation.subject?.trim() || conversation.subject,
        unread: false,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    throw new Error(getCanvasFriendlyError(error));
  }
}
