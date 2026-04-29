/**
 * Barrel re-export for all view-model functions.
 *
 * Each domain has its own module under `./view-models/`:
 *   - connection.ts  — getCanvasConnectionView
 *   - dashboard.ts   — getDashboardView
 *   - calendar.ts    — getCalendarView
 *   - todo.ts        — getTodoView
 *   - notifications.ts — getNotificationsView
 *   - inbox.ts       — getInboxView, getInboxConversationView, getInboxConversationAssistView
 *   - tutors.ts      — getTutorCoursesView
 *
 * Import from "@/server/canvas/view-models" still works unchanged.
 */

export { getCanvasConnectionView } from "@/server/canvas/view-models/connection";
export { getDashboardView } from "@/server/canvas/view-models/dashboard";
export { getCalendarView } from "@/server/canvas/view-models/calendar";
export { getTodoView } from "@/server/canvas/view-models/todo";
export { getNotificationsView } from "@/server/canvas/view-models/notifications";
export {
  getInboxView,
  getInboxConversationView,
  getInboxConversationAssistView,
} from "@/server/canvas/view-models/inbox";
export { getTutorCoursesView } from "@/server/canvas/view-models/tutors";
