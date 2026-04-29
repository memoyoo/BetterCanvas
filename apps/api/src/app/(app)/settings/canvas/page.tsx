import { KeyRound, Unplug } from "lucide-react";

import { CanvasSettingsActions } from "@/app/(app)/settings/canvas/CanvasSettingsActions";
import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { magicLinkConfigured } from "@/lib/auth";
import { getCanvasSyncSetupIssues } from "@/server/canvas/service";
import { getCanvasConnectionView } from "@/server/canvas/view-models";
import { getCurrentUser } from "@/server/session";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function CanvasSettingsPage({ searchParams }: PageProps) {
  const [{ status }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const connection = await getCanvasConnectionView(user?.id);
  const syncSetupIssues = getCanvasSyncSetupIssues();
  const syncDisabledReason = !magicLinkConfigured
    ? "Configure auth and database env vars before BetterCanvas can sync a live Canvas account."
    : syncSetupIssues.length > 0
      ? `Add ${syncSetupIssues.join(" and ")} before running Canvas sync actions.`
      : null;
  const statusMessage =
    status === "synced"
      ? "Canvas sync finished and the app was refreshed with the latest data."
      : status === "disconnected"
        ? "Canvas was disconnected and the synced account data was cleared."
        : null;

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Connection settings"
        description="Manage the live Canvas connection, re-run the server-side sync, or disconnect the linked account."
        eyebrow="Settings"
        title="Canvas connection"
      />

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-100">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={connection.connected ? "secondary" : "outline"}>
                Account state
              </Badge>
              <KeyRound className="text-primary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              {connection.connected
                ? `Connected to ${connection.domainHost}`
                : "No Canvas account connected yet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm leading-7">
            {connection.connected ? (
              <>
                <p>
                  Connected as <span className="text-white">{connection.label ?? "Canvas user"}</span>.
                </p>
                <p>
                  Last successful sync:{" "}
                  <span className="text-white">
                    {connection.lastSyncedLabel ?? "just now"}
                  </span>
                </p>
                <p>
                  {connection.courseCount} synced course
                  {connection.courseCount === 1 ? "" : "s"}, {connection.upcomingCount} upcoming
                  planner item{connection.upcomingCount === 1 ? "" : "s"}, and{" "}
                  {connection.unreadConversationCount} unread conversation
                  {connection.unreadConversationCount === 1 ? "" : "s"} are currently in BetterCanvas.
                </p>
              </>
            ) : (
              <>
                <p>
                  Run through Canvas onboarding to verify a token, encrypt it at
                  rest, and populate the app with real course data.
                </p>
                <p>
                  Once connected, this page shows connection health, sync status,
                  and account controls.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Danger zone</Badge>
              <Unplug className="text-muted-foreground size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Disconnect Canvas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm leading-7">
            <p>
              Re-run sync to refresh courses, planner items, activity, and inbox
              threads. Disconnecting removes the linked `CanvasAccount` and its
              cached sync data.
            </p>
            <CanvasSettingsActions
              connected={connection.connected}
              syncDisabledReason={syncDisabledReason}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
