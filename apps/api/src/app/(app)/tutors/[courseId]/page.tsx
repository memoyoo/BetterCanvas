import { notFound } from "next/navigation";
import { FileText, Sparkles } from "lucide-react";

import {
  askTutorQuestion,
  ingestTutorCourseFiles,
  startTutorThread,
} from "@/app/(app)/tutors/[courseId]/actions";
import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/server/session";
import { getTutorCourseView } from "@/server/tutors/service";

type PageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

function getStatusMessage(status?: string) {
  switch (status) {
    case "ingested":
      return "Course context ingested into tutor chunks.";
    case "thread-created":
      return "Tutor thread created.";
    case "message-sent":
      return "Tutor response added to the thread.";
    default:
      return null;
  }
}

export default async function TutorCoursePage({
  params,
  searchParams,
}: PageProps) {
  const { courseId } = await params;
  const { error, status } = await searchParams;
  const user = await getCurrentUser();

  if (!user?.canvasAccount) {
    notFound();
  }

  const tutor = await getTutorCourseView(user.id, courseId);

  if (!tutor) {
    notFound();
  }

  const statusMessage = getStatusMessage(status);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <form action={ingestTutorCourseFiles}>
              <input name="courseId" type="hidden" value={courseId} />
              <Button size="sm" variant="secondary">
                <FileText className="size-4" />
                Ingest course context
              </Button>
            </form>
            <form action={startTutorThread}>
              <input name="courseId" type="hidden" value={courseId} />
              <Button size="sm">
                <Sparkles className="size-4" />
                New thread
              </Button>
            </form>
          </>
        }
        badge={tutor.course.courseCode?.trim() || "Canvas course"}
        description="This tutor route now uses persisted tutor threads and grounded course chunks built from synced Canvas context."
        eyebrow="Socratic tutor"
        title={tutor.course.name}
      />

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-100">
          {statusMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Course thread
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tutor.messages.length > 0 ? (
              tutor.messages.map((message) => (
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
              ))
            ) : (
              <div className="text-muted-foreground rounded-[1.75rem] border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                Ingest the course context, then ask a grounded question to start the first tutor exchange.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/70 rounded-[2rem] border-white/8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Grounding</Badge>
                <FileText className="text-secondary size-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-white">
                Synced course context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                {tutor.chunkCount} recent tutor chunk{tutor.chunkCount === 1 ? "" : "s"} are currently available for this course.
              </div>
              {tutor.course.chunks.map((chunk) => (
                <div
                  className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                  key={chunk.id}
                >
                  <p className="text-sm font-semibold text-white">{chunk.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-7">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/70 rounded-[2rem] border-white/8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                Ask the tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={askTutorQuestion} className="space-y-4">
                <input name="courseId" type="hidden" value={courseId} />
                <input
                  name="threadId"
                  type="hidden"
                  value={tutor.activeThreadId ?? ""}
                />
                <Textarea
                  name="question"
                  placeholder="Ask about a synced assignment, planner item, or recent course activity."
                  required
                  rows={6}
                />
                <Button className="w-full" size="sm">
                  Send question
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
