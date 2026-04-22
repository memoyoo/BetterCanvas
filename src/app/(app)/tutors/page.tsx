import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tutorCourses } from "@/lib/mock-data";

export default function TutorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link href="/tutors/cs-340">
              Open sample chat
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        }
        badge="Per-course tutors"
        description="Each course gets its own grounded tutor thread. The M1 page proves the course picker and interaction shape before RAG, streaming, and persistence arrive."
        eyebrow="AI study support"
        title="Tutors"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {tutorCourses.map((course) => (
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
    </div>
  );
}
