import Link from "next/link";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/server/session";
import { getInboxView } from "@/server/canvas/view-models";

export default async function InboxPage() {
  const user = await getCurrentUser();
  const inbox = await getInboxView(user?.id);
  const connectionHref = inbox.connected ? "/settings/canvas" : "/onboarding/canvas";
  const connectionLabel = inbox.connected ? "Canvas settings" : "Connect Canvas";
  const firstThread = inbox.threads[0];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href={connectionHref}>
              <Sparkles className="size-4" />
              {connectionLabel}
            </Link>
          </Button>
        }
        badge={inbox.connected ? "Synced inbox" : "Connect Canvas"}
        description={
          inbox.connected
            ? "Inbox threads now come from the synced Canvas account, with full message timelines fetched on demand."
            : "Connect Canvas to replace the starter inbox with your real conversation list."
        }
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
            {inbox.threads.length > 0 ? (
              inbox.threads.map((thread) => (
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
                    <span>{thread.participants.join(" · ") || "Canvas participants"}</span>
                    <span>{thread.updatedAt}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                {inbox.connected
                  ? "No inbox conversations were available in the latest sync."
                  : "Connect Canvas to load your inbox threads here."}
              </div>
            )}
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
              "Thread summaries will condense the key asks into a few bullets.",
              "Reply drafting will help shape a concise, polite response.",
              "Unread or unanswered conversations stay surfaced first.",
            ].map((item) => (
              <div
                className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7"
                key={item}
              >
                {item}
              </div>
            ))}
            <Button asChild className="mt-2 w-full" size="sm">
              <Link href={firstThread ? `/inbox/${firstThread.id}` : connectionHref}>
                {firstThread ? "Open latest thread" : connectionLabel}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
