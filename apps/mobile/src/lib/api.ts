import type { CanvasConnectRequest, MobileSession } from "@bettercanvas/shared";
import {
  calendarResponseSchema,
  canvasOAuthCompleteRequestSchema,
  canvasOAuthConfigResponseSchema,
  canvasOAuthStartResponseSchema,
  canvasSyncResponseSchema,
  canvasConnectRequestSchema,
  dashboardResponseSchema,
  inboxConversationResponseSchema,
  inboxResponseSchema,
  mobileUserSchema,
  mobileSessionSchema,
  notificationsResponseSchema,
  successResponseSchema,
  taskResponseSchema,
  todoResponseSchema,
  tutorCourseResponseSchema,
  tutorCoursesResponseSchema,
  tutorIngestResponseSchema,
  tutorQuestionResponseSchema,
} from "@bettercanvas/shared";

import { getApiBaseUrl } from "@/lib/config";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let unauthorizedHandler: (() => void | Promise<void>) | null = null;

export function onUnauthorized(handler: (() => void | Promise<void>) | null) {
  unauthorizedHandler = handler;
}

async function parseJsonResponse<T>(response: Response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      await unauthorizedHandler?.();
    }

    throw new ApiError(response.status, payload?.error ?? "Request failed.");
  }

  return payload as T;
}

async function parsePublicJsonResponse(response: Response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, payload?.error ?? "Request failed.");
  }

  return payload;
}

async function authenticatedRequest<T>(
  path: string,
  token: string,
  options?: RequestInit,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  return parseJsonResponse<T>(response);
}

export async function getCanvasOAuthConfig() {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/auth/canvas-oauth/config`,
  );
  const payload = await parsePublicJsonResponse(response);

  return canvasOAuthConfigResponseSchema.parse(payload);
}

export async function startCanvasOAuth(domain: string) {
  const params = new URLSearchParams({ domain });
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/auth/canvas-oauth/start?${params.toString()}`,
  );
  const payload = await parsePublicJsonResponse(response);

  return canvasOAuthStartResponseSchema.parse(payload);
}

export async function completeCanvasOAuth(input: {
  code: string;
  domain: string;
  state: string;
}) {
  const body = canvasOAuthCompleteRequestSchema.parse(input);
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/auth/canvas-oauth/complete`,
    {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  const payload = await parseJsonResponse<unknown>(response);

  return mobileSessionSchema.parse(payload);
}

export async function canvasConnect(
  request: CanvasConnectRequest,
): Promise<MobileSession> {
  const parsedRequest = canvasConnectRequestSchema.parse(request);
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/canvas-connect`, {
    body: JSON.stringify(parsedRequest),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await parseJsonResponse<unknown>(response);

  return mobileSessionSchema.parse(payload);
}

export async function getCurrentMobileUser(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/me", token);

  return mobileUserSchema.parse(payload);
}

export async function getDashboard(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/dashboard", token);

  return dashboardResponseSchema.parse(payload);
}

export async function getCalendar(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/calendar", token);

  return calendarResponseSchema.parse(payload);
}

export async function getTodo(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/todo", token);

  return todoResponseSchema.parse(payload);
}

export async function getNotifications(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/notifications", token);

  return notificationsResponseSchema.parse(payload);
}

export async function getInbox(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/inbox", token);

  return inboxResponseSchema.parse(payload);
}

export async function getInboxConversation(token: string, conversationId: string) {
  const payload = await authenticatedRequest<unknown>(
    `/api/v1/inbox/${conversationId}`,
    token,
  );

  return inboxConversationResponseSchema.parse(payload);
}

export async function sendInboxReply(
  token: string,
  conversationId: string,
  payload: { message: string },
) {
  const response = await authenticatedRequest<unknown>(
    `/api/v1/inbox/${conversationId}`,
    token,
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
  );

  return successResponseSchema.parse(response);
}

export async function getTutorCourses(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/tutors/courses", token);

  return tutorCoursesResponseSchema.parse(payload);
}

export async function getTutorCourse(token: string, courseId: string) {
  const payload = await authenticatedRequest<unknown>(
    `/api/v1/tutors/courses/${courseId}`,
    token,
  );

  return tutorCourseResponseSchema.parse(payload);
}

export async function runCanvasSync(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/sync/run", token, {
    method: "POST",
  });

  return canvasSyncResponseSchema.parse(payload);
}

export async function disconnectCanvas(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/auth/disconnect", token, {
    method: "POST",
  });

  return successResponseSchema.parse(payload);
}

export async function deleteAccount(token: string) {
  const payload = await authenticatedRequest<unknown>("/api/v1/me", token, {
    method: "DELETE",
  });

  return successResponseSchema.parse(payload);
}

export async function createTask(
  token: string,
  payload: { dueDate?: string; notes?: string; title: string },
) {
  const response = await authenticatedRequest<unknown>("/api/v1/todo/tasks", token, {
    body: JSON.stringify(payload),
    method: "POST",
  });

  return taskResponseSchema.parse(response);
}

export async function updateTask(
  token: string,
  taskId: string,
  payload: {
    completed?: boolean;
    dueDate?: string;
    notes?: string;
    title?: string;
  },
) {
  const response = await authenticatedRequest<unknown>(
    `/api/v1/todo/tasks/${taskId}`,
    token,
    {
      body: JSON.stringify(payload),
      method: "PATCH",
    },
  );

  return taskResponseSchema.parse(response);
}

export async function deleteTask(token: string, taskId: string) {
  const payload = await authenticatedRequest<unknown>(
    `/api/v1/todo/tasks/${taskId}`,
    token,
    {
      method: "DELETE",
    },
  );

  return successResponseSchema.parse(payload);
}

export async function ingestTutorCourse(token: string, courseId: string) {
  const payload = await authenticatedRequest<unknown>(
    `/api/v1/tutors/courses/${courseId}/ingest`,
    token,
    {
      method: "POST",
    },
  );

  return tutorIngestResponseSchema.parse(payload);
}

export async function sendTutorQuestion(
  token: string,
  courseId: string,
  payload: { question: string; threadId?: string | null },
) {
  const response = await authenticatedRequest<unknown>(
    `/api/v1/tutors/courses/${courseId}/messages`,
    token,
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
  );

  return tutorQuestionResponseSchema.parse(response);
}
