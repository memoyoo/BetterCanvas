import { NextResponse } from "next/server";

import { mobileUserSchema } from "@bettercanvas/shared";

import { getPrismaClient } from "@/lib/db";
import { getMobileUserFromRequest } from "@/server/mobile-auth";

export async function GET(request: Request) {
  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    mobileUserSchema.parse({
      displayName: user.displayName ?? null,
      email: user.email ?? null,
      id: user.id,
    }),
  );
}

export async function DELETE(request: Request) {
  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await getPrismaClient().user.delete({
    where: { id: user.id },
  });

  return NextResponse.json({ success: true });
}
