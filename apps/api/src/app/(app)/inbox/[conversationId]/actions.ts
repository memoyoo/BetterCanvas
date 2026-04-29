"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { sendCanvasConversationReply } from "@/server/canvas/service";
import { requireUser } from "@/server/session";

const replySchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation id is missing."),
  message: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty.")
    .max(5000, "Reply is too long."),
});

function buildConversationPath(
  conversationId: string,
  params: { error?: string; status?: string },
) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.error) {
    searchParams.set("error", params.error);
  }

  const query = searchParams.toString();
  return query
    ? `/inbox/${conversationId}?${query}`
    : `/inbox/${conversationId}`;
}

export async function sendInboxReply(formData: FormData) {
  const user = await requireUser();
  const rawConversationId = formData.get("conversationId");
  const conversationIdFromForm =
    typeof rawConversationId === "string" ? rawConversationId : "";
  const parsed = replySchema.safeParse({
    conversationId: conversationIdFromForm,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    if (!conversationIdFromForm) {
      redirect("/inbox?error=Conversation+id+is+missing.");
    }

    redirect(
      buildConversationPath(conversationIdFromForm, {
        error: parsed.error.issues[0]?.message ?? "Unable to send that reply.",
      }),
    );
  }

  const { conversationId, message } = parsed.data;

  try {
    const result = await sendCanvasConversationReply({
      conversationId,
      message,
      userId: user.id,
    });

    if (!result) {
      redirect(
        buildConversationPath(conversationId, {
          error: "That conversation could not be found.",
        }),
      );
    }
  } catch (error) {
    redirect(
      buildConversationPath(conversationId, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send that message right now.",
      }),
    );
  }

  revalidatePath("/inbox");
  revalidatePath(`/inbox/${conversationId}`);
  redirect(buildConversationPath(conversationId, { status: "reply-sent" }));
}
