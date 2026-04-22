import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { conversationMessages, inboxThreads } from "@/lib/mock-data";

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const thread = inboxThreads.find((item) => item.id === conversationId);

  if (!thread) {
    notFound();
  }

  const messages =
    conversationMessages[conversationId as keyof typeof conversationMessages] ??
    [];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button size="sm" variant="secondary">
              <Sparkles className="size-4" />
              Summarize
            </Button>
            <Button size="sm">Draft reply</Button>
          </>
        }
        badge={thread.unread ? "Unread" : "Thread"}
        description={thread.preview}
        eyebrow="Canvas conversation"
        title={thread.subject}
      />

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Message timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((message) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
