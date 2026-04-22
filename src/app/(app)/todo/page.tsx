import { ListTodo, Shuffle } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todoItems } from "@/lib/mock-data";

export default function TodoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button size="sm">
            <Shuffle className="size-4" />
            Re-prioritize
          </Button>
        }
        badge="Merged queue"
        description="Canvas planner items and personal tasks will live together here. The placeholder list already includes source labels, quick timing context, and an AI-generated ordering cue."
        eyebrow="Task board"
        title="To do"
      />

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge>AI suggested order</Badge>
            <ListTodo className="text-primary size-5" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            Work queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todoItems.map((item) => (
            <div
              className="flex flex-col gap-4 rounded-3xl border border-white/6 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between"
              key={item.id}
            >
              <div>
                <p className="text-base font-semibold text-white">
                  {item.title}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.source} · {item.eta}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{item.priority}</Badge>
                <Badge variant="outline">{item.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
