import { getPrismaClient } from "@/lib/db";
import {
  addDays,
  endOfDay,
  formatDayLabel,
  formatFullDayLabel,
  formatScheduledTimeLabel,
  getCanvasAccountByUserId,
  startOfToday,
} from "@/server/canvas/view-model-helpers";

export async function getCalendarView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account) {
    return {
      connected: false,
      days: [] as { count: number; day: string; focus: string; key: string }[],
      upcomingItems: [] as {
        allDay: boolean;
        id: string;
        startLabel: string;
        title: string;
        type: string;
      }[],
      selectedDayItems: [] as { time: string; title: string; type: string }[],
      selectedDayLabel: "Connect Canvas",
    };
  }

  const prisma = getPrismaClient();
  const today = startOfToday();
  const nextWeek = addDays(today, 6);
  const calendarItems = await prisma.calendarEvent.findMany({
    where: {
      canvasAccountId: account.id,
      startAt: {
        gte: today,
        lte: endOfDay(nextWeek),
      },
    },
    orderBy: [{ startAt: "asc" }, { updatedAt: "desc" }],
  });

  const itemsByDay = new Map<string, typeof calendarItems>();

  for (const item of calendarItems) {
    const key = item.startAt.toISOString().slice(0, 10);
    itemsByDay.set(key, [...(itemsByDay.get(key) ?? []), item]);
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index);
    const key = date.toISOString().slice(0, 10);
    const items = itemsByDay.get(key) ?? [];

    return {
      count: items.length,
      day: formatDayLabel(date),
      focus: items[0]?.title ?? "No due work",
      key,
    };
  });

  const selectedDay = days.find((day) => day.count > 0) ?? days[0];
  const selectedDate = new Date(`${selectedDay.key}T00:00:00`);
  const selectedItems = itemsByDay.get(selectedDay.key) ?? [];

  return {
    connected: true,
    days,
    upcomingItems: calendarItems.slice(0, 12).map((item) => ({
      allDay: item.allDay,
      id: item.id,
      startLabel: formatScheduledTimeLabel(item.startAt, item.allDay),
      title: item.title,
      type: item.type === "assignment" ? "assignment due" : "Canvas event",
    })),
    selectedDayItems: selectedItems.map((item) => ({
      time: formatScheduledTimeLabel(item.startAt, item.allDay),
      title: item.title,
      type: item.type === "assignment" ? "assignment due" : "Canvas event",
    })),
    selectedDayLabel: formatFullDayLabel(selectedDate),
  };
}
