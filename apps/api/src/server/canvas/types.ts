export type CanvasUser = {
  id: number;
  name: string;
  short_name?: string | null;
  sortable_name?: string | null;
  primary_email?: string | null;
};

export type CanvasCourse = {
  id: number;
  name: string;
  course_code?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  color?: string | null;
  workflow_state?: string | null;
  enrollment_state?: string | null;
  term?: {
    name?: string | null;
  } | null;
};

export type CanvasCourseFile = {
  id: number | string;
  content_type?: string | null;
  "content-type"?: string | null;
  display_name?: string | null;
  filename?: string | null;
  html_url?: string | null;
  size?: number | null;
  updated_at?: string | null;
  url?: string | null;
};

export type CanvasCoursePageSummary = {
  front_page?: boolean | null;
  html_url?: string | null;
  page_id?: number | null;
  published?: boolean | null;
  title?: string | null;
  updated_at?: string | null;
  url: string;
};

export type CanvasCoursePage = CanvasCoursePageSummary & {
  body?: string | null;
};

export type CanvasAssignmentSubmission = {
  excused?: boolean | null;
  missing?: boolean | null;
  score?: number | null;
  submitted_at?: string | null;
  workflow_state?: string | null;
};

export type CanvasAssignment = {
  id: number;
  course_id: number;
  name: string;
  html_url?: string | null;
  due_at?: string | null;
  points_possible?: number | null;
  submission_types?: string[] | null;
  submission?: CanvasAssignmentSubmission | null;
};

export type CanvasPlannerSubmissionState = {
  submitted?: boolean;
  excused?: boolean;
  graded?: boolean;
  late?: boolean;
  missing?: boolean;
  needs_grading?: boolean;
  with_feedback?: boolean;
};

export type CanvasPlannerItem = {
  course_id?: number | null;
  html_url?: string | null;
  plannable_id?: number | string | null;
  plannable_type?: string | null;
  planner_override?: {
    marked_complete?: boolean | null;
  } | null;
  submissions?: false | CanvasPlannerSubmissionState | null;
  plannable?: {
    title?: string | null;
    name?: string | null;
    due_at?: string | null;
    todo_date?: string | null;
    html_url?: string | null;
  } | null;
};

export type CanvasActivityItem = {
  id: number | string;
  title: string;
  message?: string | null;
  type: string;
  created_at: string;
  updated_at?: string | null;
  html_url?: string | null;
  course_id?: number | null;
  read_state?: boolean | null;
};

export type CanvasConversationParticipant = {
  id: number;
  name?: string | null;
  full_name?: string | null;
};

export type CanvasConversationMessage = {
  id: number;
  author_id?: number | null;
  body?: string | null;
  created_at?: string | null;
};

export type CanvasConversation = {
  id: number;
  subject?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  workflow_state?: string | null;
  starred?: boolean | null;
  participants?: CanvasConversationParticipant[] | null;
  messages?: CanvasConversationMessage[] | null;
};

export type CanvasUpcomingEvent = {
  id: number | string;
  title: string;
  description?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  all_day?: boolean | null;
  all_day_date?: string | null;
  html_url?: string | null;
  context_code?: string | null;
  assignment?: {
    id: number;
    name?: string | null;
    course_id?: number | null;
    html_url?: string | null;
    due_at?: string | null;
    points_possible?: number | null;
    submission_types?: string[] | null;
  } | null;
};

export type CanvasInitialSyncSnapshot = {
  user: CanvasUser;
  courses: CanvasCourse[];
  assignments: CanvasAssignment[];
  plannerItems: CanvasPlannerItem[];
  activityItems: CanvasActivityItem[];
  conversations: CanvasConversation[];
  calendarEvents: CanvasUpcomingEvent[];
};
