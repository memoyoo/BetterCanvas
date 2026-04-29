import Link from "next/link";
import { ListTodo, Shuffle } from "lucide-react";

import {
  completePersonalTask,
  createPersonalTask,
  deletePersonalTask,
  reopenPersonalTask,
  updatePersonalTask,
} from "@/app/(app)/todo/actions";
import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/server/session";
import { getTodoView } from "@/server/canvas/view-models";

type PageProps = {
  searchParams: Promise<{ error?: string; status?: string }>;
};

function getStatusMessage(status?: string) {
  switch (status) {
    case "task-created":
      return "Personal task created.";
    case "task-updated":
      return "Personal task updated.";
    case "task-completed":
      return "Personal task marked complete.";
    case "task-reopened":
      return "Personal task moved back into the active queue.";
    case "task-deleted":
      return "Personal task deleted.";
    default:
      return null;
  }
}

export default async function TodoPage({ searchParams }: PageProps) {
  const { error, status } = await searchParams;
  const user = await getCurrentUser();
  const todo = await getTodoView(user?.id);
  const connectionHref = todo.connected ? "/settings/canvas" : "/onboarding/canvas";
  const connectionLabel = todo.connected ? "Canvas settings" : "Connect Canvas";
  const statusMessage = getStatusMessage(status);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild size="sm">
            <Link href={connectionHref}>
              <Shuffle className="size-4" />
              {connectionLabel}
            </Link>
          </Button>
        }
        badge={todo.connected ? "Merged queue" : "Connect Canvas"}
        description={
          todo.connected
            ? "Canvas planner items and personal tasks are merged here into a single actionable queue."
            : "Connect Canvas to replace the placeholder queue with your real due work."
        }
        eyebrow="Task board"
        title="To do"
      />

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-100">
          {statusMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          {error}
        </div>
      ) : null}

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">Personal task</Badge>
            <ListTodo className="text-secondary size-5" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            Add a task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPersonalTask} className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  name="title"
                  placeholder="Prep for Thursday study block"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-notes">Notes</Label>
                <Textarea
                  id="task-notes"
                  name="notes"
                  placeholder="Optional context, checklist, or reminder"
                  rows={4}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due date</Label>
                <Input id="task-due-date" name="dueDate" type="date" />
              </div>
              <div className="rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7 text-white/80">
                Personal tasks sit beside Canvas work in the same queue, so you can
                plan everything in one place.
              </div>
              <Button className="w-full" size="sm">
                Save task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge>Suggested order</Badge>
            <ListTodo className="text-primary size-5" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            Work queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todo.items.length > 0 ? (
            todo.items.map((item) => (
              <div
                className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
                key={item.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.source} · {item.detail}
                    </p>
                    {item.notes ? (
                      <p className="text-muted-foreground mt-3 text-sm leading-7">
                        {item.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.priority}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                </div>

                {item.isPersonalTask ? (
                  <div className="mt-4 grid gap-4 border-t border-white/6 pt-4 lg:grid-cols-[0.85fr_0.15fr]">
                    <form action={updatePersonalTask} className="grid gap-3 sm:grid-cols-2">
                      <input name="taskId" type="hidden" value={item.id} />
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`title-${item.id}`}>Edit title</Label>
                        <Input
                          defaultValue={item.title}
                          id={`title-${item.id}`}
                          name="title"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`due-${item.id}`}>Due date</Label>
                        <Input
                          defaultValue={item.dueDateValue}
                          id={`due-${item.id}`}
                          name="dueDate"
                          type="date"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                        <Textarea
                          defaultValue={item.notes ?? ""}
                          id={`notes-${item.id}`}
                          name="notes"
                          rows={3}
                        />
                      </div>
                      <Button size="sm" variant="secondary">
                        Save changes
                      </Button>
                    </form>

                    <div className="flex flex-col gap-2">
                      <form action={completePersonalTask}>
                        <input name="taskId" type="hidden" value={item.id} />
                        <Button className="w-full" size="sm">
                          Mark complete
                        </Button>
                      </form>
                      <form action={deletePersonalTask}>
                        <input name="taskId" type="hidden" value={item.id} />
                        <Button className="w-full" size="sm" variant="destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
              {todo.connected
                ? "No open planner items or personal tasks were found."
                : "Connect Canvas to fill this queue with your synced planner items."}
            </div>
          )}
        </CardContent>
      </Card>

      {todo.completedTasks.length > 0 ? (
        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Recently completed personal tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todo.completedTasks.map((task) => (
              <div
                className="flex flex-col gap-4 rounded-3xl border border-white/6 bg-white/[0.03] p-4 md:flex-row md:items-start md:justify-between"
                key={task.id}
              >
                <div>
                  <p className="text-base font-semibold text-white">
                    {task.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {task.status}
                  </p>
                  {task.notes ? (
                    <p className="text-muted-foreground mt-3 text-sm leading-7">
                      {task.notes}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:min-w-40">
                  <form action={reopenPersonalTask}>
                    <input name="taskId" type="hidden" value={task.id} />
                    <Button className="w-full" size="sm" variant="secondary">
                      Reopen
                    </Button>
                  </form>
                  <form action={deletePersonalTask}>
                    <input name="taskId" type="hidden" value={task.id} />
                    <Button className="w-full" size="sm" variant="destructive">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
