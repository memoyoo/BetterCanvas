// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const count = vi.fn();
const create = vi.fn();
const findMany = vi.fn();
const transaction = vi.fn(async (callback: (tx: unknown) => Promise<void>) =>
  callback({
    tutorMessage: {
      create,
    },
  }),
);

vi.mock("@/lib/db", () => ({
  getPrismaClient: () => ({
    course: {
      findFirst,
    },
    courseChunk: {
      count,
      findMany,
    },
    $transaction: transaction,
    tutorThread: {
      create,
      findFirst,
    },
  }),
}));

describe("submitTutorQuestion", () => {
  it("creates a thread and assistant reply with citations", async () => {
    findFirst
      .mockResolvedValueOnce({
        id: "course-1",
        name: "Algorithms",
      })
      .mockResolvedValueOnce(null);
    count.mockResolvedValueOnce(2);
    create.mockResolvedValueOnce({
      id: "thread-1",
    });
    findMany.mockResolvedValueOnce([
      {
        content: "Binary heaps are used for priority queues in Algorithms.",
        createdAt: new Date(),
        id: "chunk-1",
        sourceUrl: "/tutors/course-1?source=assignment:1",
        title: "Priority queues",
      },
      {
        content: "Graph traversal comes up in Algorithms assignments and planner items.",
        createdAt: new Date(),
        id: "chunk-2",
        sourceUrl: "/tutors/course-1?source=planner_item:2",
        title: "Graph traversal",
      },
    ]);

    const { submitTutorQuestion } = await import("@/server/tutors/service");
    const result = await submitTutorQuestion({
      courseId: "course-1",
      question: "How do priority queues work in this course?",
      userId: "user-1",
    });

    expect(result).toEqual({ threadId: "thread-1" });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          content: "How do priority queues work in this course?",
          role: "user",
        }),
      }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "assistant",
        }),
      }),
    );
  });
});
