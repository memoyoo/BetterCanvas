import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/server/session";
import { getTutorCoursesView } from "@/server/canvas/view-models";

export default async function TutorsPage() {
  const user = await getCurrentUser();
  const tutors = await getTutorCoursesView(user?.id);
  const firstCourse = tutors.courses[0];
  const connectionHref = tutors.connected ? "/settings/canvas" : "/onboarding/canvas";
  const actionHref = firstCourse ? `/tutors/${firstCourse.id}` : connectionHref;
  const actionLabel = firstCourse ? "Open first course" : "Connect Canvas";

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link href={actionHref}>
              {actionLabel}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
        badge={tutors.connected ? "Synced courses" : "Connect Canvas"}
        description={
          tutors.connected
            ? "Each synced course can now ingest grounded context and host persisted tutor threads."
            : "Connect Canvas to turn the tutor picker into a live list of your synced courses."
        }
        eyebrow="AI study support"
        title="Tutors"
      />

      {tutors.courses.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {tutors.courses.map((course) => (
            <Card
              className="glass-panel rounded-[2rem] border-0 bg-transparent"
              key={course.id}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge>{course.name}</Badge>
                  <Sparkles className="text-primary size-5" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-7">
                  {course.focus}
                </p>
                <Button asChild className="w-full" size="sm" variant="secondary">
                  <Link href={`/tutors/${course.id}`}>Open tutor</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardContent className="text-muted-foreground p-6 text-sm leading-7">
            {tutors.connected
              ? "No synced courses are available for tutors yet."
              : "Connect Canvas first, then each synced course will appear here as a tutor entry point."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
