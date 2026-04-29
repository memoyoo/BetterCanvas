import { z } from "zod";

export const canvasConnectRequestSchema = z.object({
  domain: z.string().trim().min(1),
  token: z.string().trim().min(1),
});

export const canvasOAuthConfigResponseSchema = z.object({
  enabled: z.boolean(),
  redirectUri: z.string().nullable().optional(),
});

export const canvasOAuthStartResponseSchema = z.object({
  authorizeUrl: z.string().url(),
});

export const canvasOAuthCompleteRequestSchema = z.object({
  code: z.string().trim().min(1),
  domain: z.string().trim().min(1),
  state: z.string().trim().min(1),
});

export const mobileUserSchema = z.object({
  displayName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  id: z.string(),
});

export const mobileSessionSchema = z.object({
  token: z.string(),
  user: mobileUserSchema,
});

export const dashboardResponseSchema = z.object({
  announcements: z.array(
    z.object({
      course: z.string(),
      id: z.string(),
      time: z.string(),
      title: z.string(),
    }),
  ),
  atRiskCourses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      score: z.string(),
      signal: z.string(),
    }),
  ),
  briefing: z.array(z.string()),
  connected: z.boolean(),
  dueItems: z.array(
    z.object({
      course: z.string(),
      due: z.string(),
      id: z.string(),
      status: z.string(),
      title: z.string(),
    }),
  ),
});

export const calendarResponseSchema = z.object({
  connected: z.boolean(),
  days: z.array(
    z.object({
      count: z.number(),
      day: z.string(),
      focus: z.string(),
      key: z.string(),
    }),
  ),
  selectedDayItems: z.array(
    z.object({
      time: z.string(),
      title: z.string(),
      type: z.string(),
    }),
  ),
  selectedDayLabel: z.string(),
  upcomingItems: z.array(
    z.object({
      id: z.string(),
      startLabel: z.string(),
      title: z.string(),
      type: z.string(),
    }),
  ),
});

export const todoItemSchema = z.object({
  detail: z.string(),
  dueDateValue: z.string().optional(),
  id: z.string(),
  isPersonalTask: z.boolean(),
  notes: z.string().nullable(),
  priority: z.string(),
  source: z.string(),
  status: z.string(),
  title: z.string(),
});

export const todoCompletedTaskSchema = z.object({
  dueDateValue: z.string(),
  id: z.string(),
  notes: z.string().nullable(),
  status: z.string(),
  title: z.string(),
});

export const todoResponseSchema = z.object({
  completedTasks: z.array(todoCompletedTaskSchema),
  connected: z.boolean(),
  items: z.array(todoItemSchema),
});

export const notificationsResponseSchema = z.object({
  connected: z.boolean(),
  items: z.array(
    z.object({
      course: z.string(),
      detail: z.string(),
      id: z.string(),
      time: z.string(),
      title: z.string(),
    }),
  ),
  summary: z.string(),
});

export const inboxResponseSchema = z.object({
  connected: z.boolean(),
  threads: z.array(
    z.object({
      id: z.string(),
      participants: z.array(z.string()),
      preview: z.string(),
      subject: z.string(),
      unread: z.boolean(),
      updatedAt: z.string(),
    }),
  ),
});

export const inboxConversationResponseSchema = z.object({
  draftReply: z.string(),
  messages: z.array(
    z.object({
      author: z.string(),
      body: z.string(),
      createdAt: z.string(),
      id: z.string(),
    }),
  ),
  preview: z.string(),
  subject: z.string(),
  summary: z.array(z.string()),
  unread: z.boolean(),
});

export const tutorCoursesResponseSchema = z.object({
  connected: z.boolean(),
  courses: z.array(
    z.object({
      focus: z.string(),
      id: z.string(),
      name: z.string(),
      title: z.string(),
    }),
  ),
});

export const tutorCourseResponseSchema = z.object({
  activeThreadId: z.string().nullable(),
  chunkCount: z.number(),
  course: z
    .object({
      chunks: z.array(
        z.object({
          content: z.string(),
          id: z.string(),
          title: z.string(),
        }),
      ),
      courseCode: z.string().nullable().optional(),
      name: z.string(),
    })
    .passthrough(),
  messages: z.array(
    z.object({
      citations: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
          }),
        )
        .optional(),
      content: z.string(),
      id: z.string(),
      role: z.enum(["assistant", "user"]),
    }),
  ),
});

export const canvasSyncResponseSchema = z.object({
  accountId: z.string(),
  counts: z.object({
    activityItems: z.number(),
    assignments: z.number(),
    calendarEvents: z.number(),
    conversations: z.number(),
    courses: z.number(),
    plannerItems: z.number(),
  }),
  syncedAt: z.string(),
});

export const successResponseSchema = z.object({
  success: z.literal(true),
});

export const taskResponseSchema = z
  .object({
    completed: z.boolean(),
    dueAt: z.string().nullable(),
    id: z.string(),
    notes: z.string().nullable(),
    title: z.string(),
  })
  .passthrough();

export const tutorIngestResponseSchema = z.object({
  chunkCount: z.number(),
  courseId: z.string(),
  courseName: z.string(),
});

export const tutorQuestionResponseSchema = z.object({
  threadId: z.string(),
});

export type CanvasConnectRequest = z.infer<typeof canvasConnectRequestSchema>;
export type MobileSession = z.infer<typeof mobileSessionSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
export type CalendarResponse = z.infer<typeof calendarResponseSchema>;
export type TodoResponse = z.infer<typeof todoResponseSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type InboxResponse = z.infer<typeof inboxResponseSchema>;
export type InboxConversationResponse = z.infer<typeof inboxConversationResponseSchema>;
export type TutorCoursesResponse = z.infer<typeof tutorCoursesResponseSchema>;
export type TutorCourseResponse = z.infer<typeof tutorCourseResponseSchema>;
