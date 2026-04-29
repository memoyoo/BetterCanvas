import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { getInbox } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

export default function InboxScreen() {
  const { session } = useStoredSession();
  const inboxQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["inbox", session?.token],
    queryFn: () => getInbox(session!.token),
  });
  const inbox = inboxQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void inboxQuery.refetch();
          }}
          refreshing={inboxQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Inbox
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">Synced conversations</Text>

      <View className="mt-6 gap-4">
        {inboxQuery.isFetching ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">Loading inbox...</Text>
          </View>
        ) : null}

        {inbox?.threads?.length ? (
          inbox.threads.map((thread) => (
            <Link asChild href={`/inbox/${thread.id}` as never} key={thread.id}>
              <Pressable accessibilityRole="button">
                <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
                  <Text className="text-base font-semibold text-white">
                    {thread.subject}
                  </Text>
                  <Text className="mt-2 text-sm leading-7 text-muted">
                    {thread.preview}
                  </Text>
                  <Text className="mt-2 text-xs text-muted">
                    {thread.participants.join(" - ")} - {thread.updatedAt}
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))
        ) : inboxQuery.isFetching ? null : (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">
              No synced inbox threads are available yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
