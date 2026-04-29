import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/db";

export const getServerSession = cache(async () => auth());

export const getCurrentUser = cache(async () => {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return null;
  }

  return getPrismaClient().user.findUnique({
    where: { id: session.user.id },
    include: { canvasAccount: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function getCanvasAccount() {
  const user = await getCurrentUser();
  return user?.canvasAccount ?? null;
}

export async function requireCanvasAccount() {
  const canvasAccount = await getCanvasAccount();

  if (!canvasAccount) {
    redirect("/onboarding/canvas");
  }

  return canvasAccount;
}
