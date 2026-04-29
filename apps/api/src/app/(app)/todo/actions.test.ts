// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/db", () => ({
  getPrismaClient: () => ({
    task: {
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      findFirst: mockFindFirst,
    },
  }),
}));

const mockRequireUser = vi.fn();
vi.mock("@/server/session", () => ({
  requireUser: () => mockRequireUser(),
}));

const redirectCalls: string[] = [];
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectCalls.push(url);
    throw new Error(`REDIRECT:${url}`);
  },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeFormData(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

const MOCK_USER = { id: "user-1", canvasAccount: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("todo/actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectCalls.length = 0;
    mockRequireUser.mockResolvedValue(MOCK_USER);
  });

  describe("createPersonalTask", () => {
    it("creates a task and redirects with status=task-created", async () => {
      mockCreate.mockResolvedValue({ id: "task-1" });

      const { createPersonalTask } = await import("./actions");

      await expect(
        createPersonalTask(makeFormData({ title: "Study for finals", notes: "Ch. 3-5", dueDate: "2026-05-01" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockCreate).toHaveBeenCalledOnce();
      const createArg = mockCreate.mock.calls[0][0];
      expect(createArg.data.title).toBe("Study for finals");
      expect(createArg.data.notes).toBe("Ch. 3-5");
      expect(createArg.data.userId).toBe("user-1");
      expect(createArg.data.dueAt).toBeInstanceOf(Date);
      expect(redirectCalls[redirectCalls.length - 1]).toContain("task-created");
    });

    it("redirects with error when title is empty", async () => {
      const { createPersonalTask } = await import("./actions");

      await expect(
        createPersonalTask(makeFormData({ title: "" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockCreate).not.toHaveBeenCalled();
      expect(redirectCalls[redirectCalls.length - 1]).toContain("error=");
    });
  });

  describe("completePersonalTask", () => {
    it("marks a task as completed", async () => {
      mockFindFirst.mockResolvedValue({ id: "task-1", userId: "user-1" });
      mockUpdate.mockResolvedValue({});

      const { completePersonalTask } = await import("./actions");

      await expect(
        completePersonalTask(makeFormData({ taskId: "task-1" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockUpdate).toHaveBeenCalledOnce();
      expect(mockUpdate.mock.calls[0][0].data.completed).toBe(true);
      expect(redirectCalls[redirectCalls.length - 1]).toContain("task-completed");
    });
  });

  describe("reopenPersonalTask", () => {
    it("marks a task as not completed", async () => {
      mockFindFirst.mockResolvedValue({ id: "task-1", userId: "user-1" });
      mockUpdate.mockResolvedValue({});

      const { reopenPersonalTask } = await import("./actions");

      await expect(
        reopenPersonalTask(makeFormData({ taskId: "task-1" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockUpdate).toHaveBeenCalledOnce();
      expect(mockUpdate.mock.calls[0][0].data.completed).toBe(false);
      expect(redirectCalls[redirectCalls.length - 1]).toContain("task-reopened");
    });
  });

  describe("deletePersonalTask", () => {
    it("deletes the task and redirects", async () => {
      mockFindFirst.mockResolvedValue({ id: "task-1", userId: "user-1" });
      mockDelete.mockResolvedValue({});

      const { deletePersonalTask } = await import("./actions");

      await expect(
        deletePersonalTask(makeFormData({ taskId: "task-1" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockDelete).toHaveBeenCalledWith({ where: { id: "task-1" } });
      expect(redirectCalls[redirectCalls.length - 1]).toContain("task-deleted");
    });

    it("redirects with error when task is not found", async () => {
      mockFindFirst.mockResolvedValue(null);

      const { deletePersonalTask } = await import("./actions");

      await expect(
        deletePersonalTask(makeFormData({ taskId: "nonexistent" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockDelete).not.toHaveBeenCalled();
      expect(redirectCalls[redirectCalls.length - 1]).toContain("error=");
    });
  });

  describe("updatePersonalTask", () => {
    it("updates a task with new data", async () => {
      mockFindFirst.mockResolvedValue({ id: "task-1", userId: "user-1" });
      mockUpdate.mockResolvedValue({});

      const { updatePersonalTask } = await import("./actions");

      let thrownError: Error | null = null;
      try {
        await updatePersonalTask(makeFormData({ taskId: "task-1", title: "Updated title", notes: "New notes", dueDate: "2026-06-01" }));
      } catch (e) {
        thrownError = e as Error;
      }

      expect(thrownError).toBeTruthy();
      expect(thrownError!.message).toContain("REDIRECT");

      // The redirect should contain task-updated (not an error)
      const lastRedirect = redirectCalls[redirectCalls.length - 1];
      expect(lastRedirect).toContain("task-updated");

      // update should have been called before the redirect
      expect(mockUpdate).toHaveBeenCalled();
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg.data.title).toBe("Updated title");
      expect(updateArg.data.notes).toBe("New notes");
    });
  });
});

