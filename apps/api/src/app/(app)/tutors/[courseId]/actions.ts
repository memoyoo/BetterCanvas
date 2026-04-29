"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTutorThread,
  ingestTutorCourseContext,
  submitTutorQuestion,
} from "@/server/tutors/service";
import { requireUser } from "@/server/session";

function buildTutorPath(courseId: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return query ? `/tutors/${courseId}?${query}` : `/tutors/${courseId}`;
}

function revalidateTutorRoute(courseId: string) {
  revalidatePath(`/tutors/${courseId}`);
  revalidatePath("/tutors");
}

export async function ingestTutorCourseFiles(formData: FormData) {
  const user = await requireUser();
  const courseId = formData.get("courseId");

  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    redirect("/tutors");
  }

  try {
    await ingestTutorCourseContext(user.id, courseId);
  } catch (error) {
    redirect(
      buildTutorPath(courseId, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to ingest course context right now.",
      }),
    );
  }

  revalidateTutorRoute(courseId);
  redirect(buildTutorPath(courseId, { status: "ingested" }));
}

export async function startTutorThread(formData: FormData) {
  const user = await requireUser();
  const courseId = formData.get("courseId");

  if (typeof courseId !== "string" || courseId.trim().length === 0) {
    redirect("/tutors");
  }

  const thread = await createTutorThread({
    courseId,
    userId: user.id,
  });

  if (!thread) {
    redirect(buildTutorPath(courseId, { error: "Unable to create a tutor thread." }));
  }

  revalidateTutorRoute(courseId);
  redirect(buildTutorPath(courseId, { status: "thread-created" }));
}

export async function askTutorQuestion(formData: FormData) {
  const user = await requireUser();
  const courseId = formData.get("courseId");
  const question = formData.get("question");
  const threadId = formData.get("threadId");

  if (
    typeof courseId !== "string" ||
    courseId.trim().length === 0 ||
    typeof question !== "string"
  ) {
    redirect("/tutors");
  }

  try {
    await submitTutorQuestion({
      courseId,
      question,
      threadId: typeof threadId === "string" && threadId.length > 0 ? threadId : null,
      userId: user.id,
    });
  } catch (error) {
    redirect(
      buildTutorPath(courseId, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send that tutor question right now.",
      }),
    );
  }

  revalidateTutorRoute(courseId);
  redirect(buildTutorPath(courseId, { status: "message-sent" }));
}
