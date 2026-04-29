import { NextResponse } from "next/server";

import { getTutorCourseView } from "@/server/tutors/service";
import { getMobileUserFromRequest } from "@/server/mobile-auth";

type RouteProps = {
  params: Promise<{ courseId: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const user = await getMobileUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const tutor = await getTutorCourseView(user.id, courseId);

  if (!tutor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tutor);
}
