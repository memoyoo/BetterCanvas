import Link from "next/link";
import { ArrowUpRight, BellDot, CalendarRange, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardView } from "@/server/canvas/view-models";
import { getCurrentUser } from "@/server/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const dashboard = await getDashboardView(user?.id);
  const connectionHref = dashboard.connected ? "/settings/canvas" : "/onboarding/canvas";
  const connectionLabel = dashboard.connected ? "Canvas settings" : "Connect Canvas";

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button asChild size="sm" variant="secondary">
              <Link href="/calendar">
                <CalendarRange className="size-4" />
                Open calendar
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={connectionHref}>
                <ArrowUpRight className="size-4" />
                {connectionLabel}
              </Link>
            </Button>
          </>
        }
        badge={dashboard.connected ? "Live Canvas data" : "Connect Canvas"}
        description={
          dashboard.connected
            ? "This dashboard is now driven by the synced Canvas account: due items, recent activity, and inbox pressure all come from the database."
            : "Connect Canvas to replace the starter dashboard with your real due work, activity, and inbox signals."
        }
        eyebrow="Daily command center"
        title="What matters today"
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>Daily briefing</Badge>
              <Sparkles className="text-primary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Daily overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.briefing.length > 0 ? (
              <ul className="space-y-3">
                {dashboard.briefing.map((item) => (
                  <li
                    className="text-muted-foreground rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-sm leading-7"
                    key={item}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-sm leading-7">
                No briefing is available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Recent changes</Badge>
              <BellDot className="text-secondary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Announcements and activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.announcements.length > 0 ? (
              dashboard.announcements.map((announcement) => (
                <div
                  className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
                  key={announcement.id}
                >
                  <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                    {announcement.course}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {announcement.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {announcement.time}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground rounded-2xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                No recent Canvas activity has been synced yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Due now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.dueItems.length > 0 ? (
              dashboard.dueItems.map((item) => (
                <div
                  className="flex flex-col gap-3 rounded-3xl border border-white/6 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={item.id}
                >
                  <div>
                    <p className="text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.course} · {item.due}
                    </p>
                  </div>
                  <Badge
                    variant={item.status === "On track" ? "secondary" : "default"}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                {dashboard.connected
                  ? "No upcoming due items were found in the current planner sync window."
                  : "Connect Canvas to surface your next due items here."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              At-risk courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.atRiskCourses.length > 0 ? (
              dashboard.atRiskCourses.map((course) => (
                <div
                  className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                  key={course.id}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-white">
                      {course.name}
                    </p>
                    <Badge variant="outline">{course.score}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {course.signal}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                {dashboard.connected
                  ? "Courses look calm right now."
                  : "At-risk signals will appear here once Canvas is connected and synced."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
