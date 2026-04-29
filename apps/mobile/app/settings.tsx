import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";

import { deleteAccount, disconnectCanvas, runCanvasSync } from "@/lib/api";
import { getPublicWebUrl } from "@/lib/config";
import { clearStoredSession } from "@/lib/session";
import { useStoredSession } from "@/hooks/useStoredSession";

const supportLinks = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Support", path: "/support" },
  { label: "Account deletion help", path: "/delete-account" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { loading, session } = useStoredSession();
  const syncMutation = useMutation({
    mutationFn: () => runCanvasSync(session!.token),
  });
  const disconnectMutation = useMutation({
    mutationFn: () => disconnectCanvas(session!.token),
    onSuccess: async () => {
      await clearStoredSession();
      router.replace("/connect-canvas");
    },
  });
  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(session!.token),
    onSuccess: async () => {
      await clearStoredSession();
      router.replace("/connect-canvas");
    },
  });

  const openSupportLink = async (path: string) => {
    await Linking.openURL(getPublicWebUrl(path));
  };

  const confirmAccountDeletion = () => {
    if (!session || deleteAccountMutation.isPending) {
      return;
    }

    Alert.alert(
      "Delete BetterCanvas account?",
      "This removes your BetterCanvas account, Canvas connection, synced coursework, messages, tasks, and tutor history from BetterCanvas.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => deleteAccountMutation.mutate(),
          style: "destructive",
          text: "Delete account",
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-10">
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Settings
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">Account and privacy</Text>

      <View className="mt-6 gap-4">
        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Session</Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {loading
              ? "Checking secure session storage..."
              : session
                ? `Signed in as ${session.user.displayName ?? session.user.email ?? session.user.id}.`
                : "No active mobile session."}
          </Text>
        </View>

        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Help and policies</Text>
          <View className="mt-3 gap-3">
            {supportLinks.map((item) => (
              <Pressable
                accessibilityRole="link"
                key={item.path}
                onPress={() => {
                  void openSupportLink(item.path);
                }}
              >
                <Text className="text-sm font-semibold text-secondary">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-primary px-5 py-4"
          disabled={!session || syncMutation.isPending}
          onPress={() => syncMutation.mutate()}
        >
          <Text className="text-center text-base font-semibold text-white">
            {syncMutation.isPending ? "Syncing..." : "Run Canvas sync"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="rounded-full border border-white/10 px-5 py-4"
          disabled={!session}
          onPress={async () => {
            await clearStoredSession();
            router.replace("/connect-canvas");
          }}
        >
          <Text className="text-center text-base font-semibold text-white">
            Sign out on this device
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-red-500 px-5 py-4"
          disabled={!session || disconnectMutation.isPending}
          onPress={() => disconnectMutation.mutate()}
        >
          <Text className="text-center text-base font-semibold text-white">
            {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Canvas"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="rounded-full border border-red-400/50 px-5 py-4"
          disabled={!session || deleteAccountMutation.isPending}
          onPress={confirmAccountDeletion}
        >
          <Text className="text-center text-base font-semibold text-red-100">
            {deleteAccountMutation.isPending
              ? "Deleting account..."
              : "Delete BetterCanvas account"}
          </Text>
        </Pressable>

        {(syncMutation.error || disconnectMutation.error || deleteAccountMutation.error) ? (
          <View className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-4">
            <Text className="text-sm leading-6 text-red-100">
              {syncMutation.error instanceof Error
                ? syncMutation.error.message
                : disconnectMutation.error instanceof Error
                  ? disconnectMutation.error.message
                  : deleteAccountMutation.error instanceof Error
                    ? deleteAccountMutation.error.message
                  : "Unable to complete that action."}
            </Text>
          </View>
        ) : null}

        <Link href="/dashboard">
          <Text className="text-sm font-semibold text-secondary">Back to dashboard</Text>
        </Link>
      </View>
    </ScrollView>
  );
}
