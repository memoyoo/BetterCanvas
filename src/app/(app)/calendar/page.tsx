import { ArrowLeftRight, CalendarCheck2, Plus } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { weekSchedule } from "@/lib/mock-data";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button size="sm" variant="secondary">
              <ArrowLeftRight className="size-4" />
              Month
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
              Add task
            </Button>
          </>
        }
        badge="Month + week shell"
        description="The calendar scaffold already merges the right concepts: Canvas events, assignment due dates, and personal tasks. M4 will swap the placeholders for cached sync data."
        eyebrow="Schedule view"
        title="Calendar and workload"
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>Month view</Badge>
              <CalendarCheck2 className="text-primary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Week density
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
            {weekSchedule.map((day) => (
              <div
                className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                key={day.day}
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
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Selected day
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                time: "9:00 AM",
                title: "CS 340 lecture",
                type: "Canvas event",
              },
              {
                time: "1:30 PM",
                title: "Studio critique prep",
                type: "Personal task",
              },
              {
                time: "11:59 PM",
                title: "Algorithms problem set 04",
                type: "Assignment due",
              },
            ].map((item) => (
              <div
                className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                key={item.title}
              >
                <p className="text-secondary text-xs font-semibold tracking-[0.2em] uppercase">
                  {item.time}
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {item.title}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.type}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
