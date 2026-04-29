import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { createTask, deleteTask, getTodo, updateTask } from "@/lib/api";
import { useStoredSession } from "@/hooks/useStoredSession";

export default function TodoScreen() {
  const { session } = useStoredSession();
  const queryClient = useQueryClient();
  const [dueDate, setDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const todoQuery = useQuery({
    enabled: Boolean(session?.token),
    queryKey: ["todo", session?.token],
    queryFn: () => getTodo(session!.token),
  });
  const refreshTodo = async () => {
    await queryClient.invalidateQueries({ queryKey: ["todo", session?.token] });
  };
  const createTaskMutation = useMutation({
    mutationFn: () =>
      createTask(session!.token, {
        dueDate,
        notes,
        title,
      }),
    onSuccess: async () => {
      setDueDate("");
      setTitle("");
      setNotes("");
      await refreshTodo();
    },
  });
  const updateTaskMutation = useMutation({
    mutationFn: (
      input:
        | { completed: boolean; taskId: string }
        | {
            dueDate?: string;
            notes?: string;
            taskId: string;
            title?: string;
          },
    ) => updateTask(session!.token, input.taskId, input),
    onSuccess: refreshTodo,
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(session!.token, taskId),
    onSuccess: refreshTodo,
  });
  const todo = todoQuery.data;

  return (
    <ScrollView
      className="flex-1 bg-background px-6 py-10"
      refreshControl={
        <RefreshControl
          onRefresh={() => {
            void todoQuery.refetch();
          }}
          refreshing={todoQuery.isRefetching}
          tintColor="#8b7cff"
        />
      }
    >
      <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
        To do
      </Text>
      <Text className="mt-3 text-3xl font-bold text-white">Merged queue</Text>

      <View className="mt-6 gap-4">
        <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
          <Text className="text-sm font-semibold text-white">Add personal task</Text>
          <TextInput
            className="mt-3 rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
            onChangeText={setTitle}
            placeholder="Prepare for Thursday study block"
            placeholderTextColor="#8f94ac"
            value={title}
          />
          <TextInput
            className="mt-3 min-h-28 rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
            multiline
            onChangeText={setNotes}
            placeholder="Optional notes"
            placeholderTextColor="#8f94ac"
            textAlignVertical="top"
            value={notes}
          />
          <TextInput
            className="mt-3 rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
            onChangeText={setDueDate}
            placeholder="Due date (YYYY-MM-DD)"
            placeholderTextColor="#8f94ac"
            value={dueDate}
          />
          <Pressable
            accessibilityRole="button"
            className="mt-3 rounded-full bg-primary px-4 py-4"
            onPress={() => {
              if (title.trim()) {
                createTaskMutation.mutate();
              }
            }}
          >
            <Text className="text-center text-sm font-semibold text-white">
              {createTaskMutation.isPending ? "Saving..." : "Save task"}
            </Text>
          </Pressable>
        </View>

        {todoQuery.isFetching ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">Loading queue...</Text>
          </View>
        ) : null}

        {todo?.items?.length ? (
          todo.items.map((item) => (
            <View
              className="rounded-3xl border border-white/10 bg-card px-4 py-4"
              key={item.id}
            >
              <Text className="text-base font-semibold text-white">{item.title}</Text>
              <Text className="mt-2 text-sm leading-7 text-muted">
                {item.source} - {item.detail}
              </Text>
              {item.notes ? (
                <Text className="mt-2 text-sm leading-7 text-muted">{item.notes}</Text>
              ) : null}
              <Text className="mt-2 text-xs text-muted">
                {item.priority} - {item.status}
              </Text>

              {item.isPersonalTask ? (
                <View className="mt-4 gap-3">
                  {editingTaskId === item.id ? (
                    <View className="gap-3">
                      <TextInput
                        className="rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
                        onChangeText={setEditingTitle}
                        placeholder="Task title"
                        placeholderTextColor="#8f94ac"
                        value={editingTitle}
                      />
                      <TextInput
                        className="min-h-24 rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
                        multiline
                        onChangeText={setEditingNotes}
                        placeholder="Task notes"
                        placeholderTextColor="#8f94ac"
                        textAlignVertical="top"
                        value={editingNotes}
                      />
                      <TextInput
                        className="rounded-3xl border border-white/10 bg-background px-4 py-4 text-white"
                        onChangeText={setEditingDueDate}
                        placeholder="Due date (YYYY-MM-DD)"
                        placeholderTextColor="#8f94ac"
                        value={editingDueDate}
                      />
                      <View className="flex-row gap-3">
                        <Pressable
                          accessibilityRole="button"
                          className="rounded-full bg-primary px-4 py-3"
                          onPress={() => {
                            updateTaskMutation.mutate({
                              dueDate: editingDueDate || undefined,
                              notes: editingNotes,
                              taskId: item.id,
                              title: editingTitle,
                            });
                            setEditingTaskId(null);
                          }}
                        >
                          <Text className="text-sm font-semibold text-white">Save</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          className="rounded-full border border-white/10 px-4 py-3"
                          onPress={() => setEditingTaskId(null)}
                        >
                          <Text className="text-sm font-semibold text-white">Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row flex-wrap gap-3">
                      <Pressable
                        accessibilityRole="button"
                        className="rounded-full bg-primary px-4 py-3"
                        onPress={() =>
                          updateTaskMutation.mutate({
                            completed: true,
                            taskId: item.id,
                          })
                        }
                      >
                        <Text className="text-sm font-semibold text-white">Complete</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        className="rounded-full border border-white/10 px-4 py-3"
                        onPress={() => {
                          setEditingTaskId(item.id);
                          setEditingTitle(item.title);
                          setEditingNotes(item.notes ?? "");
                          setEditingDueDate(item.dueDateValue ?? "");
                        }}
                      >
                        <Text className="text-sm font-semibold text-white">Edit</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        className="rounded-full bg-red-500 px-4 py-3"
                        onPress={() => deleteTaskMutation.mutate(item.id)}
                      >
                        <Text className="text-sm font-semibold text-white">Delete</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          ))
        ) : todoQuery.isFetching ? null : (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm leading-7 text-muted">
              No active queue items are available yet.
            </Text>
          </View>
        )}

        {todo?.completedTasks.length ? (
          <View className="rounded-3xl border border-white/10 bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-white">Completed personal tasks</Text>
            <View className="mt-3 gap-3">
              {todo.completedTasks.map((task) => (
                <View
                  className="rounded-3xl border border-white/10 bg-background px-4 py-4"
                  key={task.id}
                >
                  <Text className="text-sm font-semibold text-white">{task.title}</Text>
                  <Text className="mt-2 text-sm leading-7 text-muted">{task.status}</Text>
                  <Pressable
                    accessibilityRole="button"
                    className="mt-3 rounded-full bg-primary px-4 py-3"
                    onPress={() =>
                      updateTaskMutation.mutate({
                        completed: false,
                        taskId: task.id,
                      })
                    }
                  >
                    <Text className="text-center text-sm font-semibold text-white">
                      Reopen
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
