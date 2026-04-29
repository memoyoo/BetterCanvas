import { getPrismaClient } from "@/lib/db";
import {
  courseLabel,
  formatRelativeTime,
  getCanvasAccountByUserId,
  truncate,
} from "@/server/canvas/view-model-helpers";

export async function getNotificationsView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account) {
    return {
      connected: false,
      items: [] as {
        course: string;
        detail: string;
        id: string;
        time: string;
        title: string;
      }[],
      summary:
        "Connect Canvas to generate a live digest of announcements, activity, and conversation changes.",
    };
  }

  const prisma = getPrismaClient();
  const [items, unreadConversations] = await Promise.all([
    prisma.activityItem.findMany({
      where: {
        canvasAccountId: account.id,
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12,
    }),
    prisma.conversation.count({
      where: {
        canvasAccountId: account.id,
        unread: true,
      },
    }),
  ]);

  const mappedItems = items.map((item) => ({
    course: item.course ? courseLabel(item.course) : item.type,
    detail:
      truncate(item.message, 140) ||
      "Open Canvas to see the full change details.",
    id: item.id,
    time: formatRelativeTime(item.createdAt) ?? "recently",
    title: item.title,
  }));

  const summaryParts = [
    mappedItems[0]
      ? `${mappedItems[0].course} is the latest thing that changed in Canvas.`
      : null,
    unreadConversations > 0
      ? `${unreadConversations} unread inbox thread${unreadConversations === 1 ? "" : "s"} still need attention.`
      : "No unread Canvas conversations right now.",
    mappedItems.length > 1
      ? `${mappedItems.length} recent activity item${mappedItems.length === 1 ? "" : "s"} are ready for review.`
      : null,
  ].filter(Boolean);

  return {
    connected: true,
    items: mappedItems,
    summary:
      summaryParts.join(" ") ||
      "Canvas is connected, but no recent activity has been synced yet.",
  };
}
