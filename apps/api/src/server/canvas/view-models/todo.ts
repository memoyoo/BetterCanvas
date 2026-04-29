import { getPrismaClient } from "@/lib/db";
import {
  courseLabel,
  formatDateInputValue,
  formatDueLabel,
  getAssignmentIdentityKey,
  getCanvasAccountByUserId,
  getPlannerAssignmentIdentityKey,
  getPriorityLabel,
  getUrgencyStatus,
  sortByNullableDateAsc,
} from "@/server/canvas/view-model-helpers";

export async function getTodoView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account || !userId) {
    return {
      completedTasks: [] as {
        dueDateValue: string;
        id: string;
        notes: string | null;
        status: string;
        title: string;
      }[],
      connected: false,
      items: [] as {
        detail: string;
        id: string;
        isPersonalTask: boolean;
        notes: string | null;
        priority: string;
        source: string;
        status: string;
        title: string;
        dueDateValue: string;
      }[],
    };
  }

  const prisma = getPrismaClient();
  const [plannerItems, assignments, tasks, completedTasks] = await Promise.all([
    prisma.plannerItem.findMany({
      where: {
        canvasAccountId: account.id,
        completed: false,
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      take: 10,
    }),
    prisma.assignment.findMany({
      where: {
        course: {
          canvasAccountId: account.id,
        },
        hasSubmitted: false,
      },
      include: {
        course: true,
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      take: 10,
    }),
    prisma.task.findMany({
      where: {
        completed: false,
        userId,
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      take: 5,
    }),
    prisma.task.findMany({
      where: {
        completed: true,
        userId,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 5,
    }),
  ]);

  const syncedAssignmentKeys = new Set(
    assignments.map((assignment) =>
      getAssignmentIdentityKey(assignment.course.canvasId, assignment.canvasId),
    ),
  );

  const items = [
    ...assignments.map((assignment) => ({
      detail: formatDueLabel(assignment.dueAt),
      dueAt: assignment.dueAt,
      dueDateValue: formatDateInputValue(assignment.dueAt),
      id: assignment.id,
      isPersonalTask: false,
      notes: null,
      source: `Assignment · ${courseLabel(assignment.course)}`,
      title: assignment.name,
    })),
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

      return [
        {
          detail: formatDueLabel(item.dueAt),
          dueAt: item.dueAt,
          dueDateValue: formatDateInputValue(item.dueAt),
          id: item.id,
          isPersonalTask: false,
          notes: null,
          source: `Canvas ${item.plannableType.replace(/_/g, " ")}`,
          title: item.title,
        },
      ];
    }),
    ...tasks.map((task) => ({
      detail: formatDueLabel(task.dueAt),
      dueAt: task.dueAt,
      dueDateValue: formatDateInputValue(task.dueAt),
      id: task.id,
      isPersonalTask: true,
      notes: task.notes,
      source: "Personal task",
      title: task.title,
    })),
  ]
    .sort((left, right) => sortByNullableDateAsc(left.dueAt, right.dueAt))
    .slice(0, 12)
    .map((item) => ({
      detail: item.detail,
      dueDateValue: item.dueDateValue,
      id: item.id,
      isPersonalTask: item.isPersonalTask,
      notes: item.notes,
      priority: getPriorityLabel(item.dueAt),
      source: item.source,
      status: getUrgencyStatus(item.dueAt),
      title: item.title,
    }));

  return {
    completedTasks: completedTasks.map((task) => ({
      dueDateValue: formatDateInputValue(task.dueAt),
      id: task.id,
      notes: task.notes,
      status: task.dueAt ? formatDueLabel(task.dueAt) : "Completed",
      title: task.title,
    })),
    connected: true,
    items,
  };
}
