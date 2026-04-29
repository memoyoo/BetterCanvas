// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

const getCanvasConversationThread = vi.fn();

vi.mock("@/server/canvas/service", () => ({
  getCanvasConversationThread,
}));

describe("getInboxConversationAssistView", () => {
  it("builds summary bullets and a reply draft", async () => {
    getCanvasConversationThread.mockResolvedValueOnce({
      conversation: {
        subject: "Lab team follow-up",
        unread: true,
      },
      detail: {
        last_message: "Please confirm who is submitting.",
        messages: [
          {
            author_id: 1,
            body: "Can you confirm who is submitting the summary?",
            created_at: "2026-04-22T12:00:00.000Z",
            id: 10,
          },
          {
            author_id: 2,
            body: "I can submit if needed.",
            created_at: "2026-04-22T12:05:00.000Z",
            id: 11,
          },
        ],
        participants: [
          { full_name: "Maya", id: 1 },
          { full_name: "You", id: 2 },
        ],
      },
    });

    const { getInboxConversationAssistView } = await import(
      "@/server/canvas/view-models"
    );
    const result = await getInboxConversationAssistView("user-1", "conversation-1");

    expect(result?.summary[0]).toContain("Maya");
    expect(result?.draftReply).toContain("Hi You");
    expect(result?.messages).toHaveLength(2);
  });
});
