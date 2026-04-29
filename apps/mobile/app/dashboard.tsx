import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { getCurrentMobileUser, getDashboard } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

export default function DashboardScreen() {
  const { loading, session } = useStoredSession();
  const meQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["me", session?.token],
    queryFn: () => getCurrentMobileUser(session!.token),
  });
  const dashboardQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["dashboard", session?.token],
    queryFn: () => getDashboard(session!.token),
  });
  const dashboard = dashboardQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void meQuery.refetch();
            void dashboardQuery.refetch();
          }}
          refreshing={dashboardQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <View className="gap-3">
        <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
          Today
        </Text>
        <Text className="text-3xl font-bold text-white">
          Your Canvas command center
        </Text>
        <Text className="text-base leading-7 text-muted">
          Start with the work that needs attention, recent course activity, and
          a quick path into the rest of your student workspace.
        </Text>
      </View>

      <View className="mt-8 gap-4">
        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Account</Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {loading
              ? "Checking secure session storage..."
              : session
                ? `Signed in as ${session.user.displayName ?? session.user.email ?? session.user.id}.`
                : "Connect Canvas to start syncing your coursework."}
          </Text>
        </View>

        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Sync status</Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {dashboardQuery.isFetching
              ? "Refreshing your dashboard..."
              : dashboard
                ? dashboard.connected
                  ? "Canvas is connected and your dashboard is ready."
                  : "Connect Canvas to bring your courses into BetterCanvas."
                : meQuery.error || dashboardQuery.error
                  ? "We could not refresh your dashboard. Pull to try again."
                  : "Connect Canvas to unlock your dashboard."}
          </Text>
        </View>

        {dashboard?.briefing?.length ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-white">Daily briefing</Text>
            <View className="mt-3 gap-3">
              {dashboard.briefing.map((item) => (
                <View
                  className="rounded-3xl border border-white/10 bg-background px-4 py-4"
                  key={item}
                >
                  <Text className="text-sm leading-7 text-muted">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {dashboard?.dueItems?.length ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-white">Due now</Text>
            <View className="mt-3 gap-3">
              {dashboard.dueItems
                .slice(0, 3)
                .map((item) => (
                  <View
                    className="rounded-3xl border border-white/10 bg-background px-4 py-4"
                    key={item.id}
                  >
                    <Text className="text-sm font-semibold text-white">{item.title}</Text>
                    <Text className="mt-1 text-sm text-muted">{item.due}</Text>
                    <Text className="mt-1 text-xs text-muted">{item.status}</Text>
                  </View>
                ))}
            </View>
          </View>
        ) : null}

        {dashboard?.announcements?.length ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-white">Recent changes</Text>
            <View className="mt-3 gap-3">
              {dashboard.announcements.slice(0, 3).map((item) => (
                <View
                  className="rounded-3xl border border-white/10 bg-background px-4 py-4"
                  key={item.id}
                >
                  <Text className="text-xs font-semibold uppercase tracking-[3px] text-primary">
                    {item.course}
                  </Text>
                  <Text className="mt-2 text-sm font-semibold text-white">{item.title}</Text>
                  <Text className="mt-1 text-xs text-muted">{item.time}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Open workspace</Text>
          <View className="mt-3 gap-2">
            {[
              { href: "/calendar", label: "Calendar" },
              { href: "/todo", label: "To do" },
              { href: "/notifications", label: "Notifications" },
              { href: "/inbox", label: "Inbox" },
              { href: "/tutors", label: "Tutors" },
              { href: "/settings", label: "Settings" },
            ].map((item) => (
              <Link asChild href={item.href as never} key={item.href}>
                <Pressable accessibilityRole="button">
                  <Text className="text-sm font-semibold text-secondary">{item.label}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
