import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/nav/AppSidebar";
import { TopBar } from "@/components/nav/TopBar";
import { magicLinkConfigured } from "@/lib/auth";
import { getCanvasConnectionView } from "@/server/canvas/view-models";
import { getCurrentUser } from "@/server/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = magicLinkConfigured ? await getCurrentUser() : null;

  if (magicLinkConfigured && !user) {
    redirect("/sign-in");
  }

  const connection = await getCanvasConnectionView(user?.id);
  const studentName =
    user?.displayName?.trim() ||
    user?.name?.trim() ||
    user?.email?.trim() ||
    "BetterCanvas Student";
  const studentSubtitle = connection.connected
    ? `Last synced ${connection.lastSyncedLabel ?? "recently"} across ${connection.courseCount} course${connection.courseCount === 1 ? "" : "s"}.`
    : magicLinkConfigured
      ? "Connect Canvas to sync courses, due work, activity, and inbox threads."
      : "Limited local mode is active until the auth and database env vars are configured.";
  const connectionTitle = connection.connected
    ? `Connected to ${connection.domainHost}`
    : magicLinkConfigured
      ? "Connect your Canvas account"
      : "Limited shell enabled";
  const connectionDescription = connection.connected
    ? `${connection.upcomingCount} upcoming schedule item${connection.upcomingCount === 1 ? "" : "s"} and ${connection.unreadConversationCount} unread conversation${connection.unreadConversationCount === 1 ? "" : "s"} are ready in the app.`
    : magicLinkConfigured
      ? "BetterCanvas can now verify your token server-side, encrypt it at rest, and populate the app from live Canvas data."
      : "You can still browse the shell, but live sign-in and Canvas sync need the required env vars first.";
  const connectionHref = connection.connected
    ? "/settings/canvas"
    : "/onboarding/canvas";
  const connectionActionLabel = connection.connected
    ? "Open Canvas settings"
    : "Open onboarding";
  const connectionBadge = connection.connected
    ? "Canvas connected"
    : magicLinkConfigured
      ? "Needs Canvas"
      : "Limited mode";
  const connectionLabel = connection.connected
    ? "Canvas settings"
    : "Connect Canvas";

  return (
    <div className="min-h-screen">
      <AppSidebar
        canvasConnected={connection.connected}
        connectionActionLabel={connectionActionLabel}
        connectionDescription={connectionDescription}
        connectionHref={connectionHref}
        connectionTitle={connectionTitle}
        studentName={studentName}
        studentSubtitle={studentSubtitle}
      />
      <TopBar
        connectionBadge={connectionBadge}
        connectionHref={connectionHref}
        connectionLabel={connectionLabel}
        tutorHref="/tutors"
        tutorLabel="Course tutors"
      />
      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-10 lg:pt-28">
          {children}
        </main>
      </div>
    </div>
  );
}
