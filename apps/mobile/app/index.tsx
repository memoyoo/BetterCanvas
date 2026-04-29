import { Redirect } from "expo-router";
import { Text, View } from "react-native";

import { useStoredSession } from "@/hooks/useStoredSession";

export default function HomeScreen() {
  const { loading, session } = useStoredSession();

  if (!loading) {
    return <Redirect href={session ? "/dashboard" : "/connect-canvas"} />;
  }

  return (
    <View className="flex-1 bg-background px-6 py-16">
      <View className="mt-10 gap-4">
        <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
          BetterCanvas
        </Text>
        <Text className="text-4xl font-bold text-white">
          Native student workspace for Canvas.
        </Text>
        <Text className="text-base leading-7 text-muted">
          Bring assignments, schedule changes, messages, and course-specific
          tutoring into one calmer place.
        </Text>
      </View>
    </View>
  );
}
