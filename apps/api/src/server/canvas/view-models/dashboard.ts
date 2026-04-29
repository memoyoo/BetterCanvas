import { getPrismaClient } from "@/lib/db";
import {
  courseLabel,
  formatDueLabel,
  formatRelativeTime,
  getAssignmentIdentityKey,
  getCanvasAccountByUserId,
  getPlannerAssignmentIdentityKey,
  getUrgencyStatus,
  sortByNullableDateAsc,
  startOfToday,
} from "@/server/canvas/view-model-helpers";

export async function getDashboardView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account) {
    return {
      announcements: [],
      atRiskCourses: [],
      briefing: [
        "Connect Canvas to replace the prototype dashboard with your real courses, due work, and activity.",
      ],
      connected: false,
      dueItems: [],
    };
  }

  const prisma = getPrismaClient();
  const [courses, plannerItems, assignments, recentActivity, unreadConversations] =
    await Promise.all([
      prisma.course.findMany({
        where: {
          canvasAccountId: account.id,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.plannerItem.findMany({
        where: {
          canvasAccountId: account.id,
          completed: false,
          dueAt: {
            gte: startOfToday(),
          },
        },
        orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
        take: 12,
      }),
      prisma.assignment.findMany({
        where: {
          course: {
            canvasAccountId: account.id,
          },
          dueAt: {
            gte: startOfToday(),
          },
          hasSubmitted: false,
        },
        include: {
          course: true,
        },
        orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
        take: 12,
      }),
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
        take: 5,
      }),
      prisma.conversation.count({
        where: {
          canvasAccountId: account.id,
          unread: true,
        },
      }),
    ]);

  const courseNameByCanvasId = new Map<number, string>(
    courses.map((course) => [course.canvasId, courseLabel(course)]),
  );
  const dueItemsByCourse = new Map<number, number>();
  const syncedAssignmentKeys = new Set<string>();

  const combinedDueItems: Array<{
    courseCanvasId: number | null;
    courseName: string;
    dueAt: Date | null;
    id: string;
    title: string;
  }> = [
    ...assignments.map((assignment) => {
      const key = getAssignmentIdentityKey(
        assignment.course.canvasId,
        assignment.canvasId,
      );

      syncedAssignmentKeys.add(key);
      dueItemsByCourse.set(
        assignment.course.canvasId,
        (dueItemsByCourse.get(assignment.course.canvasId) ?? 0) + 1,
      );

      return {
        courseCanvasId: assignment.course.canvasId,
        courseName: courseLabel(assignment.course),
        dueAt: assignment.dueAt,
        id: assignment.id,
        title: assignment.name,
      };
    }),
    ...plannerItems.flatMap((item) => {
      if (item.plannableType === "assignment") {
        const key = getPlannerAssignmentIdentityKey(
          item.courseCanvasId,
          item.plannableId,
        );

        if (syncedAssignmentKeys.has(key)) {
          return [];
        }
      }

      if (item.courseCanvasId !== null) {
        dueItemsByCourse.set(
          item.courseCanvasId,
          (dueItemsByCourse.get(item.courseCanvasId) ?? 0) + 1,
        );
      }

      return [
        {
          courseCanvasId: item.courseCanvasId,
          courseName:
            (item.courseCanvasId !== null
              ? courseNameByCanvasId.get(item.courseCanvasId)
              : null) ?? "Canvas",
          dueAt: item.dueAt,
          id: item.id,
          title: item.title,
        },
      ];
    }),
  ]
    .sort((left, right) => sortByNullableDateAsc(left.dueAt, right.dueAt))
    .slice(0, 6);

  const atRiskCourses = courses
    .map((course) => {
      const count = dueItemsByCourse.get(course.canvasId) ?? 0;

      return {
        id: course.id,
        name: courseLabel(course),
        score:
          count >= 3 ? "Watchlist" : count >= 1 ? "Heads up" : "Stable",
        signal:
          count >= 1
            ? `${count} upcoming planner item${count === 1 ? "" : "s"}`
            : "No urgent planner pressure right now",
        count,
      };
    })
    .sort((left, right) => right.count - left.count)
    .slice(0, 3)
    .map((course) => ({
      id: course.id,
      name: course.name,
      score: course.score,
      signal: course.signal,
    }));

  const mappedDueItems = combinedDueItems.map((item) => ({
    course: item.courseName,
    due: formatDueLabel(item.dueAt),
    id: item.id,
    status: getUrgencyStatus(item.dueAt),
    title: item.title,
  }));

  const announcements = recentActivity.map((item) => ({
    course: item.course ? courseLabel(item.course) : item.type,
    id: item.id,
    time: formatRelativeTime(item.createdAt) ?? "recently",
    title: item.title,
  }));

  const briefing = [
    mappedDueItems[0]
      ? `${mappedDueItems[0].title} is your nearest due item and is currently ${mappedDueItems[0].status.toLowerCase()}.`
      : "No upcoming due items were found in the current planner sync window.",
    announcements[0]
      ? `${announcements[0].course} changed ${announcements[0].time}.`
      : "No recent Canvas activity has landed yet.",
    unreadConversations > 0
      ? `You have ${unreadConversations} unread Canvas conversation${unreadConversations === 1 ? "" : "s"} to review.`
      : "Inbox is clear right now.",
  ];

  return {
    announcements,
    atRiskCourses,
    briefing,
    connected: true,
    dueItems: mappedDueItems,
  };
}
