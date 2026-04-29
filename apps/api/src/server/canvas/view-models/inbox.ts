import { getPrismaClient } from "@/lib/db";
import { getCanvasConversationThread } from "@/server/canvas/service";
import {
  formatRelativeTime,
  getCanvasAccountByUserId,
  parseParticipants,
} from "@/server/canvas/view-model-helpers";

export async function getInboxView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account) {
    return {
      connected: false,
      threads: [] as {
        id: string;
        participants: string[];
        preview: string;
        subject: string;
        unread: boolean;
        updatedAt: string;
      }[],
    };
  }

  const threads = await getPrismaClient().conversation.findMany({
    where: {
      canvasAccountId: account.id,
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    take: 20,
  });

  return {
    connected: true,
    threads: threads.map((thread) => ({
      id: thread.id,
      participants: parseParticipants(thread.participants),
      preview: thread.unread
        ? "Unread Canvas conversation"
        : "Conversation synced from Canvas",
      subject: thread.subject,
      unread: thread.unread,
      updatedAt: formatRelativeTime(thread.lastMessageAt) ?? "recently",
    })),
  };
}

export async function getInboxConversationView(
  userId: string | null | undefined,
  conversationId: string,
) {
  if (!userId) {
    return null;
  }

  const thread = await getCanvasConversationThread(userId, conversationId);

  if (!thread) {
    return null;
  }

  const participantNameById = new Map(
    (thread.detail.participants ?? []).map((participant) => [
      participant.id,
      participant.full_name?.trim() ||
        participant.name?.trim() ||
        `Canvas user ${participant.id}`,
    ]),
  );

  return {
    preview:
      thread.detail.last_message?.trim() ||
      "Canvas synced this thread, and BetterCanvas fetched the full message timeline on demand.",
    subject: thread.conversation.subject,
    unread: thread.conversation.unread,
    messages: (thread.detail.messages ?? []).map((message) => ({
      author:
        (message.author_id !== null && message.author_id !== undefined
          ? participantNameById.get(message.author_id)
          : null) ?? "Canvas user",
      body: message.body?.trim() || "No message body available.",
      createdAt:
        (message.created_at
          ? formatRelativeTime(new Date(message.created_at))
          : null) ?? "recently",
      id: String(message.id),
    })),
  };
}

export async function getInboxConversationAssistView(
  userId: string | null | undefined,
  conversationId: string,
) {
  const thread = await getInboxConversationView(userId, conversationId);

  if (!thread) {
    return null;
  }

  const bulletPoints = thread.messages.slice(-3).map((message) => {
    const trimmedBody = message.body.replace(/\s+/g, " ").trim();
    const shortened =
      trimmedBody.length > 120 ? `${trimmedBody.slice(0, 117)}...` : trimmedBody;

    return `${message.author}: ${shortened}`;
  });
  const latestExternalMessage = [...thread.messages]
    .reverse()
    .find((message) => message.author !== "Canvas user");
  const recipientName = latestExternalMessage?.author || "there";
  const draftReply = latestExternalMessage
    ? `Hi ${recipientName},\n\nThanks for the update. I reviewed the thread and will follow up on the next step shortly.\n\nBest,\n${recipientName === "Canvas user" ? "Student" : "You"}`
    : "Thanks for the update. I reviewed the thread and will follow up shortly.";

  return {
    ...thread,
    draftReply,
    summary: bulletPoints.length > 0 ? bulletPoints : ["No messages available to summarize."],
  };
}
