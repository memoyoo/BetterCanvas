import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { sendInboxReply } from "@/app/(app)/inbox/[conversationId]/actions";
import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/server/session";
import { getInboxConversationAssistView } from "@/server/canvas/view-models";

type PageProps = {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
};

function getStatusMessage(status?: string) {
  switch (status) {
    case "reply-sent":
      return "Reply sent to Canvas successfully.";
    default:
      return null;
  }
}

export default async function ConversationPage({ params, searchParams }: PageProps) {
  const { conversationId } = await params;
  const { error, status } = await searchParams;
  const user = await getCurrentUser();
  const thread = await getInboxConversationAssistView(user?.id, conversationId);

  if (!thread) {
    notFound();
  }

  const statusMessage = getStatusMessage(status);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={null}
        badge={thread.unread ? "Unread" : "Thread"}
        description={thread.preview}
        eyebrow="Canvas conversation"
        title={thread.subject}
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
              Message timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {thread.messages.length > 0 ? (
              thread.messages.map((message) => (
                <div
                  className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                  key={message.id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-white">
                      {message.author}
                    </p>
                    <Badge variant="outline">{message.createdAt}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm leading-7">
                    {message.body}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
                No message timeline was returned for this conversation.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/70 rounded-[2rem] border-white/8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Conversation helper</Badge>
                <Sparkles className="text-primary size-5" />
              </div>
              <CardTitle className="text-xl font-semibold text-white">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {thread.summary.map((item) => (
                <div
                  className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/70 rounded-[2rem] border-white/8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                Reply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form action={sendInboxReply} className="space-y-3">
                <input name="conversationId" type="hidden" value={conversationId} />
                <Textarea defaultValue={thread.draftReply} name="message" required rows={8} />
                <Button className="w-full" size="sm">
                  Send to Canvas
                </Button>
              </form>
              <p className="text-muted-foreground text-sm leading-7">
                Review the helper draft, edit if needed, then send this reply to
                the Canvas conversation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
