import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { getInboxConversation, sendInboxReply } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

type InboxConversationResponse = {
  draftReply: string;
  messages: Array<{
    author: string;
    body: string;
    createdAt: string;
    id: string;
  }>;
  preview: string;
  subject: string;
  summary: string[];
  unread: boolean;
};

export default function InboxConversationScreen() {
  const params = useLocalSearchParams<{ conversationId: string }>();
  const { session } = useStoredSession();
  const queryClient = useQueryClient();
  const conversationQuery = useQuery({
    enabled: Boolean(session?.token && params.conversationId),
    queryKey: ["inbox-conversation", session?.token, params.conversationId],
    queryFn: () =>
      getInboxConversation(session!.token, params.conversationId!) as Promise<InboxConversationResponse>,
  });
  const replyMutation = useMutation({
    mutationFn: (message: string) =>
      sendInboxReply(session!.token, params.conversationId!, { message }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["inbox", session?.token],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inbox-conversation", session?.token, params.conversationId],
        }),
      ]);
    },
  });
  const conversation = conversationQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void conversationQuery.refetch();
          }}
          refreshing={conversationQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Conversation
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">
        {conversation?.subject ?? "Loading thread"}
      </Text>

      <View className="mt-6 gap-4">
        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Summary</Text>
          <View className="mt-3 gap-2">
            {conversation?.summary?.map((item) => (
              <Text className="text-sm leading-7 text-muted" key={item}>
                {item}
              </Text>
            )) ?? (
              <Text className="text-sm leading-7 text-muted">Loading summary...</Text>
            )}
          </View>
        </View>

        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Draft reply</Text>
          <TextInput
            className="mt-3 min-h-40 rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
            editable={!replyMutation.isPending}
            onChangeText={(value) => {
              queryClient.setQueryData(
                ["inbox-conversation", session?.token, params.conversationId],
                (current: InboxConversationResponse | undefined) =>
                  current
                    ? {
                        ...current,
                        draftReply: value,
                      }
                    : current,
              );
            }}
            value={conversation?.draftReply ?? ""}
            multiline
            placeholder="Draft reply will appear here"
            placeholderTextColor="#8f94ac"
            textAlignVertical="top"
          />
          <Pressable
            accessibilityRole="button"
            className="mt-3 rounded-full bg-primary px-4 py-3"
            disabled={!conversation?.draftReply?.trim() || replyMutation.isPending}
            onPress={() => {
              const message = conversation?.draftReply?.trim();

              if (!message) {
                return;
              }

              replyMutation.mutate(message);
            }}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {replyMutation.isPending ? "Sending..." : "Send to Canvas"}
            </Text>
          </Pressable>
          {replyMutation.error ? (
            <Text className="mt-3 text-sm leading-6 text-red-200">
              {replyMutation.error instanceof Error
                ? replyMutation.error.message
                : "Unable to send that message right now."}
            </Text>
          ) : null}
        </View>

        {conversation?.messages?.length ? (
          conversation.messages.map((message) => (
            <View
              className="rounded-3xl border border-white/10 bg-card px-4 py-4"
              key={message.id}
            >
              <Text className="text-sm font-semibold text-white">{message.author}</Text>
              <Text className="mt-2 text-sm leading-7 text-muted">{message.body}</Text>
              <Text className="mt-2 text-xs text-muted">{message.createdAt}</Text>
            </View>
          ))
        ) : conversationQuery.isFetching ? null : (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">
              No message timeline is available for this thread yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
