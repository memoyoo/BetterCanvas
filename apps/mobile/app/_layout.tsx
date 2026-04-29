import "../global.css";

import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";

import { AppProviders } from "@/providers/AppProviders";
import { useStoredSession } from "@/hooks/useStoredSession";

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const { loading, session } = useStoredSession();
  const rootSegment = segments[0] ?? "";
  const isPublicRoute = rootSegment === "" || rootSegment === "connect-canvas";

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <ActivityIndicator color="#8b7cff" />
        <Text className="mt-4 text-sm text-muted">Restoring secure session...</Text>
      </View>
    );
  }

  if (!session && !isPublicRoute) {
    return <Redirect href="/connect-canvas" />;
  }

  if (session && rootSegment === "connect-canvas") {
    return <Redirect href="/dashboard" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <AuthGate>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: "#09090d",
            },
            headerStyle: {
              backgroundColor: "#09090d",
            },
            headerTintColor: "#ffffff",
          }}
        />
      </AuthGate>
    </AppProviders>
  );
}
