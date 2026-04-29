import { getPrismaClient } from "@/lib/db";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatRelativeTime(date: Date | null) {
  if (!date) {
    return null;
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffMinutes) < 60) {
    return relativeTimeFormatter.format(diffMinutes, "minute");
  }

  if (Math.abs(diffHours) < 24) {
    return relativeTimeFormatter.format(diffHours, "hour");
  }

  return relativeTimeFormatter.format(diffDays, "day");
}

export function formatDueLabel(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date >= today && date < tomorrow) {
    return `Today · ${timeLabel}`;
  }

  if (date >= tomorrow && date < addDays(today, 2)) {
    return `Tomorrow · ${timeLabel}`;
  }

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} · ${timeLabel}`;
}

export function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export function formatFullDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function getUrgencyStatus(date: Date | null) {
  if (!date) {
    return "No due date";
  }

  const diffHours = (date.getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return "At risk";
  }

  if (diffHours <= 72) {
    return "Needs review";
  }

  return "On track";
}

export function getPriorityLabel(date: Date | null) {
  if (!date) {
    return "Flexible";
  }

  const diffHours = (date.getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours <= 24) {
    return "High";
  }

  if (diffHours <= 72) {
    return "Medium";
  }

  return "Low";
}

export function sortByNullableDateAsc(left: Date | null, right: Date | null) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left.getTime() - right.getTime();
}

export function formatScheduledTimeLabel(date: Date | null, allDay: boolean) {
  if (!date) {
    return "No time set";
  }

  if (allDay) {
    return "All day";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateInputValue(date: Date | null) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function truncate(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return "";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export function courseLabel(course: { name: string; courseCode: string | null }) {
  return course.courseCode?.trim() || course.name;
}

export function parseParticipants(participants: unknown) {
  if (!Array.isArray(participants)) {
    return [] as string[];
  }

  return participants
    .map((participant) => {
      if (!participant || typeof participant !== "object") {
        return null;
      }

      const maybeName =
        "name" in participant && typeof participant.name === "string"
          ? participant.name
          : null;

      return maybeName?.trim() || null;
    })
    .filter((participant): participant is string => Boolean(participant));
}

export async function getCanvasAccountByUserId(userId: string | null | undefined) {
  if (!userId) {
    return null;
  }

  return getPrismaClient().canvasAccount.findUnique({
    where: { userId },
  });
}

export function getAssignmentIdentityKey(courseCanvasId: number, assignmentCanvasId: number) {
  return `assignment:${courseCanvasId}:${assignmentCanvasId}`;
}

export function getPlannerAssignmentIdentityKey(
  courseCanvasId: number | null,
  plannableId: number,
) {
  return courseCanvasId !== null
    ? `assignment:${courseCanvasId}:${plannableId}`
    : `assignment:${plannableId}`;
}
