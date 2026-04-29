import { getPrismaClient } from "@/lib/db";
import { getCanvasHost } from "@/server/canvas/client";
import {
  formatRelativeTime,
  getCanvasAccountByUserId,
  startOfToday,
} from "@/server/canvas/view-model-helpers";

export async function getCanvasConnectionView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account) {
    return {
      connected: false,
      courseCount: 0,
      domainHost: null,
      label: null,
      lastSyncedLabel: null,
      unreadConversationCount: 0,
      upcomingCount: 0,
    };
  }

  const prisma = getPrismaClient();
  const [courseCount, unreadConversationCount, upcomingCount] = await Promise.all([
    prisma.course.count({
      where: { canvasAccountId: account.id },
    }),
    prisma.conversation.count({
      where: {
        canvasAccountId: account.id,
        unread: true,
      },
    }),
    prisma.calendarEvent.count({
      where: {
        canvasAccountId: account.id,
        startAt: {
          gte: startOfToday(),
        },
      },
    }),
  ]);

  return {
    connected: true,
    courseCount,
    domainHost: getCanvasHost(account.domain),
    label: account.label,
    lastSyncedLabel: formatRelativeTime(account.lastSyncedAt),
    unreadConversationCount,
    upcomingCount,
  };
}
