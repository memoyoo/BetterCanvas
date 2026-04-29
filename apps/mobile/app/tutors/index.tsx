import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { getTutorCourses } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

type TutorsResponse = {
  connected: boolean;
  courses: Array<{
    focus: string;
    id: string;
    name: string;
    title: string;
  }>;
};

export default function TutorsScreen() {
  const { session } = useStoredSession();
  const tutorsQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["tutor-courses", session?.token],
    queryFn: () => getTutorCourses(session!.token) as Promise<TutorsResponse>,
  });
  const tutors = tutorsQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void tutorsQuery.refetch();
          }}
          refreshing={tutorsQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Tutors
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">Grounded course tutors</Text>

      <View className="mt-6 gap-4">
        {tutorsQuery.isFetching ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">Loading courses...</Text>
          </View>
        ) : null}

        {tutors?.courses?.length ? (
          tutors.courses.map((course) => (
            <Link asChild href={`/tutors/${course.id}` as never} key={course.id}>
              <Pressable accessibilityRole="button">
                <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
                  <Text className="text-xs font-semibold uppercase tracking-[3px] text-primary">
                    {course.name}
                  </Text>
                  <Text className="mt-2 text-base font-semibold text-white">
                    {course.title}
                  </Text>
                  <Text className="mt-2 text-sm leading-7 text-muted">
                    {course.focus}
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))
        ) : tutorsQuery.isFetching ? null : (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">
              No tutor courses are ready yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
