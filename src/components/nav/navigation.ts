import type { LucideIcon } from "lucide-react";
import {
  BellDot,
  CalendarRange,
  CheckSquare,
  Inbox,
  LayoutDashboard,
  Settings2,
  Sparkles,
} from "lucide-react";

export type AppNavItem = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

export const appNavigation: AppNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Today’s priorities and course pulse",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    href: "/calendar",
    description: "Assignments, events, and tasks together",
    icon: CalendarRange,
  },
  {
    title: "To Do",
    href: "/todo",
    description: "Planner items with personal tasks",
    icon: CheckSquare,
  },
  {
    title: "Notifications",
    href: "/notifications",
    description: "Digest of what changed across Canvas",
    icon: BellDot,
  },
  {
    title: "Inbox",
    href: "/inbox",
    description: "Conversations, summaries, and drafts",
    icon: Inbox,
  },
  {
    title: "Tutors",
    href: "/tutors",
    description: "Grounded course tutors with citations",
    icon: Sparkles,
  },
  {
    title: "Settings",
    href: "/settings/canvas",
    description: "Canvas connection and account settings",
    icon: Settings2,
  },
];

export function getActiveNavItem(pathname: string) {
  return (
    appNavigation.find((item) =>
      item.href === "/dashboard"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? appNavigation[0]
  );
}
