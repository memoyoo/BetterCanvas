import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { getTutorCourse, ingestTutorCourse, sendTutorQuestion } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

type TutorCourseResponse = {
  activeThreadId: string | null;
  chunkCount: number;
  course: {
    courseCode: string | null;
    name: string;
    chunks: Array<{
      content: string;
      id: string;
      title: string;
    }>;
  };
  messages: Array<{
    citations?: Array<{ id: string; title: string }>;
    content: string;
    id: string;
    role: "assistant" | "user";
  }>;
};

export default function TutorCourseScreen() {
  const params = useLocalSearchParams<{ courseId: string }>();
  const { session } = useStoredSession();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const tutorQuery = useQuery({
    enabled: Boolean(session?.token && params.courseId),
    queryKey: ["tutor-course", session?.token, params.courseId],
    queryFn: () => getTutorCourse(session!.token, params.courseId!) as Promise<TutorCourseResponse>,
  });
  const refreshTutor = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["tutor-course", session?.token, params.courseId],
    });
  };
  const ingestMutation = useMutation({
    mutationFn: () => ingestTutorCourse(session!.token, params.courseId!),
    onSuccess: refreshTutor,
  });
  const askMutation = useMutation({
    mutationFn: () =>
      sendTutorQuestion(session!.token, params.courseId!, {
        question,
        threadId: tutorQuery.data?.activeThreadId ?? null,
      }),
    onSuccess: async () => {
      setQuestion("");
      await refreshTutor();
    },
  });
  const tutor = tutorQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void tutorQuery.refetch();
          }}
          refreshing={tutorQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        Tutor
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">
        {tutor?.course.name ?? "Course tutor"}
      </Text>

      <View className="mt-6 gap-4">
        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Grounding</Text>
          <Text className="mt-2 text-sm leading-7 text-muted">
            {tutor
              ? `${tutor.chunkCount} tutor chunk(s) are available for this course.`
              : "Load the course and ingest its synced context."}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-3 rounded-full bg-primary px-4 py-3"
            onPress={() => ingestMutation.mutate()}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {ingestMutation.isPending ? "Ingesting..." : "Ingest course context"}
            </Text>
          </Pressable>
        </View>

        {tutor?.course.chunks.map((chunk) => (
          <View
            className="rounded-3xl border border-white/10 bg-card px-4 py-4"
            key={chunk.id}
          >
            <Text className="text-sm font-semibold text-white">{chunk.title}</Text>
            <Text className="mt-2 text-sm leading-7 text-muted">{chunk.content}</Text>
          </View>
        ))}

        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Ask the tutor</Text>
          <TextInput
            className="mt-3 min-h-32 rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
            multiline
            onChangeText={setQuestion}
            placeholder="Ask about a synced assignment or recent course activity"
            placeholderTextColor="#8f94ac"
            textAlignVertical="top"
            value={question}
          />
          <Pressable
            accessibilityRole="button"
            className="mt-3 rounded-full bg-primary px-4 py-3"
            onPress={() => {
              if (question.trim()) {
                askMutation.mutate();
              }
            }}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {askMutation.isPending ? "Sending..." : "Send question"}
            </Text>
          </Pressable>
        </View>

        {tutor?.messages?.length ? (
          tutor.messages.map((message) => (
            <View
              className={`rounded-3xl border px-4 py-4 ${
                message.role === "assistant"
                  ? "border-white/10 bg-card"
                  : "border-primary/30 bg-primary/10"
              }`}
              key={message.id}
            >
              <Text className="text-sm leading-7 text-white">{message.content}</Text>
              {message.citations?.length ? (
                <View className="mt-3 gap-2">
                  {message.citations.map((citation) => (
                    <Text className="text-xs text-secondary" key={citation.id}>
                      [{citation.id}] {citation.title}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          ))
        ) : tutorQuery.isFetching ? null : (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">
              No tutor thread exists yet. Ingest the course context and ask the first question.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
