import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { getCalendar } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

export default function CalendarScreen() {
  const [view, setView] = useState<"week" | "upcoming">("week");
  const { loading, session } = useStoredSession();
  const calendarQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["calendar", session?.token],
    queryFn: () => getCalendar(session!.token),
  });
  const calendar = calendarQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void calendarQuery.refetch();
          }}
          refreshing={calendarQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Calendar
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">
        Calendar and workload
      </Text>
      <Text className="mt-3 text-base leading-7 text-muted">
        {loading
          ? "Checking the stored session..."
          : session
            ? "Synced Canvas schedule rendered natively."
            : "Connect Canvas first to unlock the native calendar."}
      </Text>

      <View className="mt-6 flex-row gap-3">
        {(["week", "upcoming"] as const).map((item) => (
          <Pressable
            accessibilityRole="button"
            className={`rounded-full px-4 py-3 text-sm font-semibold ${
              view === item ? "bg-primary text-white" : "bg-card text-muted"
            }`}
            key={item}
            onPress={() => setView(item)}
          >
            <Text className={view === item ? "text-white" : "text-muted"}>
              {item === "week" ? "Week density" : "Upcoming"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-6 gap-4">
        {calendarQuery.isFetching ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">Loading calendar...</Text>
          </View>
        ) : view === "week" ? (
          calendar?.days?.length ? calendar.days.map((day) => (
            <View
              className="rounded-3xl border border-white/10 bg-card px-4 py-4"
              key={day.key}
            >
              <Text className="text-xs font-semibold uppercase tracking-[3px] text-primary">
                {day.day}
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">{day.count}</Text>
              <Text className="mt-2 text-sm leading-7 text-muted">{day.focus}</Text>
            </View>
          )) : (
            <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
              <Text className="text-sm leading-7 text-muted">
                No weekly schedule items are available yet.
              </Text>
            </View>
          )
        ) : (
          calendar?.upcomingItems?.length ? calendar.upcomingItems.map((item) => (
            <View
              className="rounded-3xl border border-white/10 bg-card px-4 py-4"
              key={item.id}
            >
              <Text className="text-xs font-semibold uppercase tracking-[3px] text-primary">
                {item.startLabel}
              </Text>
              <Text className="mt-2 text-base font-semibold text-white">{item.title}</Text>
              <Text className="mt-1 text-sm capitalize text-muted">{item.type}</Text>
            </View>
          )) : (
            <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
              <Text className="text-sm leading-7 text-muted">
                No upcoming schedule items are available yet.
              </Text>
            </View>
          )
        )}

        {calendar?.selectedDayItems?.length ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-white">{calendar.selectedDayLabel}</Text>
            <View className="mt-3 gap-3">
              {calendar.selectedDayItems.map((item) => (
                <View
                  className="rounded-3xl border border-white/10 bg-background px-4 py-4"
                  key={`${item.time}-${item.title}`}
                >
                  <Text className="text-xs font-semibold uppercase tracking-[3px] text-secondary">
                    {item.time}
                  </Text>
                  <Text className="mt-2 text-sm font-semibold text-white">{item.title}</Text>
                  <Text className="mt-1 text-sm capitalize text-muted">{item.type}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
