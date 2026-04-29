import Link from "next/link";
import { ArrowLeftRight, CalendarCheck2, Plus } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCalendarView } from "@/server/canvas/view-models";
import { getCurrentUser } from "@/server/session";

type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  const user = await getCurrentUser();
  const calendar = await getCalendarView(user?.id);
  const connectionHref = calendar.connected ? "/settings/canvas" : "/onboarding/canvas";
  const connectionLabel = calendar.connected ? "Canvas settings" : "Connect Canvas";
  const isUpcomingView = view === "upcoming";

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button asChild size="sm" variant="secondary">
              <Link href={isUpcomingView ? "/calendar" : "/calendar?view=upcoming"}>
                <ArrowLeftRight className="size-4" />
                {isUpcomingView ? "Week density" : "Upcoming"}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={connectionHref}>
                <Plus className="size-4" />
                {connectionLabel}
              </Link>
            </Button>
          </>
        }
        badge={calendar.connected ? "Live Canvas schedule" : "Connect Canvas"}
        description={
          calendar.connected
            ? "The weekly calendar now reflects synced Canvas upcoming events and assignment due dates, grouped by day."
            : "Connect Canvas to populate the weekly calendar with upcoming due work."
        }
        eyebrow="Schedule view"
        title="Calendar and workload"
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>{isUpcomingView ? "Upcoming list" : "Week density"}</Badge>
              <CalendarCheck2 className="text-primary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              {isUpcomingView ? "Upcoming schedule" : "Week density"}
            </CardTitle>
          </CardHeader>
          <CardContent
            className={
              isUpcomingView
                ? "space-y-3"
                : "grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7"
            }
          >
            {isUpcomingView ? (
              calendar.upcomingItems.length > 0 ? (
                calendar.upcomingItems.map((item) => (
                  <div
                    className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                    key={item.id}
                  >
                    <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                      {item.startLabel}
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm capitalize">
                      {item.type}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                  {calendar.connected
                    ? "No synced events are scheduled in the current window."
                    : "Connect Canvas to see your upcoming schedule."}
                </div>
              )
            ) : calendar.days.length > 0 ? (
              calendar.days.map((day) => (
                <div
                  className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                  key={day.key}
                >
                  <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
                    {day.day}
                  </p>
                  <p className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">
                    {day.count}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs leading-5">
                    {day.focus}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground col-span-full rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                Connect Canvas to see your weekly workload density.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              {calendar.selectedDayLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calendar.selectedDayItems.length > 0 ? (
              calendar.selectedDayItems.map((item) => (
                <div
                  className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                  key={`${item.time}-${item.title}`}
                >
                  <p className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
                    {item.time}
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm capitalize">
                    {item.type}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                {calendar.connected
                  ? "No synced events or due dates land on the selected day."
                  : "Connect Canvas to view day-level workload details."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
