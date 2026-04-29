import { NextResponse } from "next/server";

import { getCalendarView } from "@/server/canvas/view-models";
import { getMobileUserFromRequest } from "@/server/mobile-auth";

export async function GET(request: Request) {
  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getCalendarView(user.id));
}
