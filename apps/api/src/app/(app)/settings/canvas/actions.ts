"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  disconnectCanvasAccount,
  syncCanvasAccount,
} from "@/server/canvas/service";
import { requireUser } from "@/server/session";

export type CanvasSettingsActionState = {
  error: string | null;
};

const initialState: CanvasSettingsActionState = {
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
  revalidatePath("/onboarding/canvas");
}

export { initialState as initialCanvasSettingsActionState };

export async function resyncCanvasConnection(
  previousState: CanvasSettingsActionState,
): Promise<CanvasSettingsActionState> {
  void previousState;
  const user = await requireUser();

  try {
    await syncCanvasAccount(user.id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to sync Canvas right now.",
    };
  }

  revalidateCanvasApp();
  redirect("/settings/canvas?status=synced");
}

export async function disconnectCanvasConnection(
  previousState: CanvasSettingsActionState,
): Promise<CanvasSettingsActionState> {
  void previousState;
  const user = await requireUser();

  try {
    await disconnectCanvasAccount(user.id);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to disconnect Canvas right now.",
    };
  }

  revalidateCanvasApp();
  redirect("/settings/canvas?status=disconnected");
}
