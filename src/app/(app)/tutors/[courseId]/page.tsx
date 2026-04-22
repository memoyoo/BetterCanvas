import { notFound } from "next/navigation";
import { FileText, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tutorCourses, tutorTranscript } from "@/lib/mock-data";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function TutorCoursePage({ params }: PageProps) {
  const { courseId } = await params;
  const course = tutorCourses.find((item) => item.id === courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button size="sm" variant="secondary">
              <FileText className="size-4" />
              Ingest course files
            </Button>
            <Button size="sm">
              <Sparkles className="size-4" />
              New thread
            </Button>
          </>
        }
        badge={course.name}
        description="The tutor route is scaffolded for streaming chat, citations, and course-specific grounding. In M6 this page will switch from mock messages to live RAG-backed responses."
        eyebrow="Socratic tutor"
        title={course.title}
      />

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Course thread
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tutorTranscript.map((message) => (
            <div
              className={`rounded-[1.75rem] border p-4 ${
                message.role === "assistant"
                  ? "border-white/6 bg-white/[0.03]"
                  : "border-primary/18 bg-primary/10 text-primary-foreground ml-auto"
              }`}
              key={message.id}
            >
              <p className="text-sm leading-7 text-white/95">
                {message.content}
              </p>
              {message.citations?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.citations.map((citation) => (
                    <Badge key={citation.id} variant="outline">
                      [{citation.id}] {citation.title}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
