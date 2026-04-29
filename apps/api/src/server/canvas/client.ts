import type {
  CanvasActivityItem,
  CanvasAssignment,
  CanvasConversation,
  CanvasCourseFile,
  CanvasCoursePage,
  CanvasCoursePageSummary,
  CanvasCourse,
  CanvasInitialSyncSnapshot,
  CanvasPlannerItem,
  CanvasUpcomingEvent,
  CanvasUser,
} from "@/server/canvas/types";

const MAX_CANVAS_PAGES = 5;

export class CanvasApiError extends Error {
  status: number;
  responseBody: string;

  constructor(status: number, responseBody: string) {
    super(`Canvas API request failed with status ${status}.`);
    this.name = "CanvasApiError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

export function normalizeCanvasDomain(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Enter your Canvas domain to continue.");
  }

  const value = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid Canvas domain, for example canvas.school.edu.");
  }

  if (!/^https?:$/.test(url.protocol)) {
    throw new Error("Canvas domains must use http or https.");
  }

  if (!url.hostname) {
    throw new Error("Enter a valid Canvas domain, for example canvas.school.edu.");
  }

  return `${url.protocol}//${url.host}`.toLowerCase();
}

export function getCanvasHost(domain: string) {
  return new URL(domain).host;
}

function buildCanvasUrl(domain: string, pathOrUrl: string) {
  return new URL(pathOrUrl, domain).toString();
}

function getNextCanvasPage(linkHeader: string | null, domain: string) {
  if (!linkHeader) {
    return null;
  }

  for (const segment of linkHeader.split(",")) {
    const match = segment.match(/<([^>]+)>;\s*rel="([^"]+)"/);

    if (match?.[2] === "next") {
      return buildCanvasUrl(domain, match[1]);
    }
  }

  return null;
}

async function parseCanvasJson<T>(response: Response) {
  const text = await response.text();

  if (!response.ok) {
    throw new CanvasApiError(response.status, text);
  }

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function requestCanvasJson<T>(domain: string, token: string, pathOrUrl: string) {
  const response = await fetch(buildCanvasUrl(domain, pathOrUrl), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseCanvasJson<T>(response);
}

async function requestCanvasJsonWithOptions<T>(
  domain: string,
  token: string,
  pathOrUrl: string,
  options: RequestInit,
) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildCanvasUrl(domain, pathOrUrl), {
    cache: "no-store",
    ...options,
    headers,
  });

  return parseCanvasJson<T>(response);
}

async function requestCanvasPaginatedJson<T>(
  domain: string,
  token: string,
  initialPath: string,
) {
  const results: T[] = [];
  let nextUrl: string | null = buildCanvasUrl(domain, initialPath);

  for (let pageIndex = 0; nextUrl && pageIndex < MAX_CANVAS_PAGES; pageIndex += 1) {
    const response = await fetch(nextUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await parseCanvasJson<T[] | { conversations: T[] }>(response);
    const pageItems = Array.isArray(payload) ? payload : payload?.conversations ?? [];

    results.push(...pageItems);
    nextUrl = getNextCanvasPage(response.headers.get("link"), domain);
  }

  return results;
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function getCanvasFriendlyError(error: unknown) {
  if (error instanceof CanvasApiError) {
    if (error.status === 401 || error.status === 403) {
      return "Canvas rejected that access token. Double-check the token and make sure it has API access.";
    }

    if (error.status === 404) {
      return "BetterCanvas could not reach that Canvas instance. Check the domain and try again.";
    }

    if (error.status >= 500) {
      return "Canvas is having trouble right now. Try again in a moment.";
    }

    return "Canvas returned an unexpected response. Please review the domain and token, then try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to Canvas. Please try again.";
}

export function getCanvasSelfUser(domain: string, token: string) {
  return requestCanvasJson<CanvasUser>(domain, token, "/api/v1/users/self");
}

export function getCanvasCourses(domain: string, token: string) {
  const url = new URL("/api/v1/courses", domain);
  url.searchParams.append("include[]", "term");
  url.searchParams.set("enrollment_state", "active");
  url.searchParams.set("per_page", "100");

  return requestCanvasPaginatedJson<CanvasCourse>(domain, token, url.toString());
}

async function getCanvasCourseAssignments(
  domain: string,
  token: string,
  courseId: number,
) {
  const url = new URL(`/api/v1/courses/${courseId}/assignments`, domain);
  url.searchParams.append("include[]", "submission");
  url.searchParams.set("order_by", "due_at");
  url.searchParams.set("per_page", "100");

  return requestCanvasPaginatedJson<CanvasAssignment>(domain, token, url.toString());
}

export async function getCanvasAssignments(
  domain: string,
  token: string,
  courses: CanvasCourse[],
) {
  if (courses.length === 0) {
    return [] as CanvasAssignment[];
  }

  const perCourseAssignments = await Promise.all(
    courses.map((course) => getCanvasCourseAssignments(domain, token, course.id)),
  );

  return perCourseAssignments.flat();
}

export async function getCanvasCourseFiles(
  domain: string,
  token: string,
  courseId: number,
) {
  const url = new URL(`/api/v1/courses/${courseId}/files`, domain);
  url.searchParams.set("per_page", "50");
  url.searchParams.set("sort", "updated_at");
  url.searchParams.set("order", "desc");

  return requestCanvasPaginatedJson<CanvasCourseFile>(domain, token, url.toString());
}

export async function getCanvasCoursePages(
  domain: string,
  token: string,
  courseId: number,
) {
  const url = new URL(`/api/v1/courses/${courseId}/pages`, domain);
  url.searchParams.set("per_page", "30");

  const pages = await requestCanvasPaginatedJson<CanvasCoursePageSummary>(
    domain,
    token,
    url.toString(),
  );

  return pages.filter((page) => typeof page.url === "string" && page.url.trim().length > 0);
}

export function getCanvasCoursePageByUrl(
  domain: string,
  token: string,
  courseId: number,
  pageUrl: string,
) {
  const encodedPageUrl = encodeURIComponent(pageUrl);

  return requestCanvasJson<CanvasCoursePage>(
    domain,
    token,
    `/api/v1/courses/${courseId}/pages/${encodedPageUrl}`,
  );
}

export function getCanvasPlannerItems(domain: string, token: string) {
  const url = new URL("/api/v1/users/self/planner/items", domain);
  const startDate = new Date();
  const endDate = new Date();

  startDate.setDate(startDate.getDate() - 1);
  endDate.setDate(endDate.getDate() + 21);

  url.searchParams.set("start_date", toDateOnly(startDate));
  url.searchParams.set("end_date", toDateOnly(endDate));
  url.searchParams.append("filter", "incomplete_items");
  url.searchParams.set("per_page", "100");

  return requestCanvasPaginatedJson<CanvasPlannerItem>(domain, token, url.toString());
}

export function getCanvasActivityItems(domain: string, token: string) {
  const url = new URL("/api/v1/users/self/activity_stream", domain);
  url.searchParams.set("only_active_courses", "true");
  url.searchParams.set("per_page", "50");

  return requestCanvasPaginatedJson<CanvasActivityItem>(domain, token, url.toString());
}

export function getCanvasConversations(domain: string, token: string) {
  const url = new URL("/api/v1/conversations", domain);
  url.searchParams.set("scope", "inbox");
  url.searchParams.append("include[]", "participant_avatars");
  url.searchParams.append("include[]", "uuid");
  url.searchParams.set("per_page", "50");

  return requestCanvasPaginatedJson<CanvasConversation>(domain, token, url.toString());
}

export function getCanvasUpcomingEvents(domain: string, token: string) {
  const url = new URL("/api/v1/users/self/upcoming_events", domain);
  url.searchParams.set("per_page", "100");

  return requestCanvasPaginatedJson<CanvasUpcomingEvent>(
    domain,
    token,
    url.toString(),
  );
}

export function getCanvasConversation(
  domain: string,
  token: string,
  conversationId: number,
) {
  return requestCanvasJson<CanvasConversation>(
    domain,
    token,
    `/api/v1/conversations/${conversationId}`,
  );
}

export function addCanvasConversationMessage(
  domain: string,
  token: string,
  conversationId: number,
  body: string,
) {
  const payload = new URLSearchParams();
  payload.set("body", body);

  return requestCanvasJsonWithOptions<CanvasConversation>(
    domain,
    token,
    `/api/v1/conversations/${conversationId}/add_message`,
    {
      body: payload.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );
}

export async function getCanvasInitialSyncSnapshot(
  domainInput: string,
  token: string,
): Promise<CanvasInitialSyncSnapshot> {
  const domain = normalizeCanvasDomain(domainInput);
  const [user, courses] = await Promise.all([
    getCanvasSelfUser(domain, token),
    getCanvasCourses(domain, token),
  ]);
  const [assignments, plannerItems, activityItems, conversations, calendarEvents] =
    await Promise.all([
      getCanvasAssignments(domain, token, courses),
      getCanvasPlannerItems(domain, token),
      getCanvasActivityItems(domain, token),
      getCanvasConversations(domain, token),
      getCanvasUpcomingEvents(domain, token),
    ]);

  return {
    user,
    courses,
    assignments,
    plannerItems,
    activityItems,
    conversations,
    calendarEvents,
  };
}
