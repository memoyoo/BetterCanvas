import { getPrismaClient } from "@/lib/db";
import { getCanvasAccountByUserId } from "@/server/canvas/view-model-helpers";

export async function getTutorCoursesView(userId: string | null | undefined) {
  const account = await getCanvasAccountByUserId(userId);

  if (!account) {
    return {
      connected: false,
      courses: [] as { focus: string; id: string; name: string; title: string }[],
    };
  }

  const courses = await getPrismaClient().course.findMany({
    where: {
      canvasAccountId: account.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    connected: true,
    courses: courses.map((course) => ({
      focus:
        "Grounded tutor flows can now attach to this synced course once RAG and message persistence are added.",
      id: course.id,
      name: course.courseCode?.trim() || "Canvas course",
      title: course.name,
    })),
  };
}
