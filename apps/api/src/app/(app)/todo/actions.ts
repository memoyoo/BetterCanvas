"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getPrismaClient } from "@/lib/db";
import { requireUser } from "@/server/session";

const baseTaskSchema = z.object({
  dueDate: z.string().trim().optional(),
  notes: z.string().trim().max(2000, "Notes are too long.").optional(),
  title: z.string().trim().min(1, "Task title is required.").max(160, "Task title is too long."),
});

function revalidateTodo() {
  revalidatePath("/todo");
}

function redirectToTodo(params: { error?: string; status?: string }) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.error) {
    searchParams.set("error", params.error);
  }

  const query = searchParams.toString();
  redirect(query ? `/todo?${query}` : "/todo");
}

function parseDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T23:59:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function getOwnedTask(taskId: string, userId: string) {
  return getPrismaClient().task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });
}

function parseTaskPayload(formData: FormData) {
  const parsed = baseTaskSchema.safeParse({
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    redirectToTodo({
      error: parsed.error.issues[0]?.message ?? "Unable to save task.",
    });
    throw new Error("Redirecting after invalid task payload.");
  }

  return parsed.data;
}

async function requireOwnedTask(taskIdValue: FormDataEntryValue | null, userId: string) {
  const taskId = typeof taskIdValue === "string" ? taskIdValue : "";

  if (!taskId) {
    redirectToTodo({ error: "Task id is missing." });
    throw new Error("Redirecting after missing task id.");
  }

  const task = await getOwnedTask(taskId, userId);

  if (!task) {
    redirectToTodo({ error: "That task could not be found." });
    throw new Error("Redirecting after missing owned task.");
  }

  return task;
}

export async function createPersonalTask(formData: FormData) {
  const user = await requireUser();
  const data = parseTaskPayload(formData);

  await getPrismaClient().task.create({
    data: {
      dueAt: parseDueDate(data.dueDate),
      notes: data.notes || null,
      title: data.title,
      userId: user.id,
    },
  });

  revalidateTodo();
  redirectToTodo({ status: "task-created" });
}

export async function updatePersonalTask(formData: FormData) {
  const user = await requireUser();
  const data = parseTaskPayload(formData);
  const task = await requireOwnedTask(formData.get("taskId"), user.id);

  await getPrismaClient().task.update({
    where: { id: task.id },
    data: {
      dueAt: parseDueDate(data.dueDate),
      notes: data.notes || null,
      title: data.title,
    },
  });

  revalidateTodo();
  redirectToTodo({ status: "task-updated" });
}

async function setTaskCompletion(taskIdValue: FormDataEntryValue | null, completed: boolean) {
  const user = await requireUser();
  const task = await requireOwnedTask(taskIdValue, user.id);

  await getPrismaClient().task.update({
    where: { id: task.id },
    data: { completed },
  });

  revalidateTodo();
  redirectToTodo({ status: completed ? "task-completed" : "task-reopened" });
}

export async function completePersonalTask(formData: FormData) {
  await setTaskCompletion(formData.get("taskId"), true);
}

export async function reopenPersonalTask(formData: FormData) {
  await setTaskCompletion(formData.get("taskId"), false);
}

export async function deletePersonalTask(formData: FormData) {
  const user = await requireUser();
  const task = await requireOwnedTask(formData.get("taskId"), user.id);

  await getPrismaClient().task.delete({
    where: { id: task.id },
  });

  revalidateTodo();
  redirectToTodo({ status: "task-deleted" });
}
