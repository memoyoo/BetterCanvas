import { useQuery } from "@tanstack/react-query";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { getNotifications } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

export default function NotificationsScreen() {
  const { session } = useStoredSession();
  const notificationsQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["notifications", session?.token],
    queryFn: () => getNotifications(session!.token),
  });
  const notifications = notificationsQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void notificationsQuery.refetch();
          }}
          refreshing={notificationsQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Notifications
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">Change awareness</Text>

      <View className="mt-6 gap-4">
        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Sync summary</Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {notificationsQuery.isFetching
              ? "Loading notifications..."
              : notifications?.summary ??
                "Connect Canvas to load notifications in the native app."}
          </Text>
        </View>

        {notifications?.items?.length ? (
          notifications.items.map((item) => (
            <View
              className="rounded-3xl border border-white/10 bg-card px-4 py-4"
              key={item.id}
            >
              <Text className="text-xs font-semibold uppercase tracking-[3px] text-primary">
                {item.course}
              </Text>
              <Text className="mt-2 text-base font-semibold text-white">{item.title}</Text>
              <Text className="mt-2 text-sm leading-7 text-muted">{item.detail}</Text>
              <Text className="mt-2 text-xs text-muted">{item.time}</Text>
            </View>
          ))
        ) : notificationsQuery.isFetching ? null : (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">
              No synced notification items are available yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
