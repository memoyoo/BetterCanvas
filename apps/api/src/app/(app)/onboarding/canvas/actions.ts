"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { connectCanvasAccount } from "@/server/canvas/service";
import { requireUser } from "@/server/session";

export type CanvasOnboardingState = {
  error: string | null;
};

const canvasOnboardingSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, "Enter your Canvas domain.")
    .max(200, "Canvas domain is too long."),
  token: z
    .string()
    .trim()
    .min(1, "Paste your Canvas access token."),
});

const initialState: CanvasOnboardingState = {
  error: null,
};

function revalidateCanvasApp() {
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/todo");
  revalidatePath("/notifications");
  revalidatePath("/inbox");
  revalidatePath("/tutors");
  revalidatePath("/settings/canvas");
}

export { initialState as initialCanvasOnboardingState };

export async function submitCanvasConnection(
  _previousState: CanvasOnboardingState,
  formData: FormData,
): Promise<CanvasOnboardingState> {
  const user = await requireUser();
  const parsed = canvasOnboardingSchema.safeParse({
    domain: formData.get("domain"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a valid Canvas domain and token.",
    };
  }

  try {
    await connectCanvasAccount({
      domain: parsed.data.domain,
      token: parsed.data.token,
      userId: user.id,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect Canvas right now.",
    };
  }

  revalidateCanvasApp();
  redirect("/dashboard");
}
