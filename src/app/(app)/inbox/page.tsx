import Link from "next/link";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inboxThreads } from "@/lib/mock-data";

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button size="sm" variant="secondary">
            <Sparkles className="size-4" />
            Draft reply
          </Button>
        }
        badge="Thread list"
        description="Conversations will sync from Canvas and layer on AI summaries and drafts. For M1, the thread list, subject hierarchy, and preview rhythm are ready."
        eyebrow="Messaging"
        title="Inbox"
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">
                Threads
              </CardTitle>
              <Mail className="text-primary size-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {inboxThreads.map((thread) => (
              <Link
                className="hover:border-primary/20 block rounded-3xl border border-white/6 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                href={`/inbox/${thread.id}`}
                key={thread.id}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-semibold text-white">
                    {thread.subject}
                  </p>
                  {thread.unread ? <Badge>Unread</Badge> : null}
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {thread.preview}
                </p>
                <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
                  <span>{thread.participants.join(" · ")}</span>
                  <span>{thread.updatedAt}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Conversation tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Summarize a thread into three bullets with key asks.",
              "Draft a concise, polite reply in the student’s voice.",
              "Highlight unread or unanswered conversations first.",
            ].map((item) => (
              <div
                className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7"
                key={item}
              >
                {item}
              </div>
            ))}
            <Button asChild className="mt-2 w-full" size="sm">
              <Link href="/inbox/lab-team">
                Open prototype thread
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
