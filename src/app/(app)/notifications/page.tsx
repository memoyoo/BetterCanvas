import { BellDot, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationsDigest } from "@/lib/mock-data";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Digest preview"
        description="This screen is ready for the activity stream and announcement sync. The M1 shell proves the balance between a short AI digest and the raw change feed beneath it."
        eyebrow="Change awareness"
        title="Notifications"
      />

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge>What matters today</Badge>
            <Sparkles className="text-primary size-5" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            AI digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-5 text-sm leading-7">
            {notificationsDigest.summary}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 rounded-[2rem] border-white/8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-white">
              Recent feed
            </CardTitle>
            <BellDot className="text-secondary size-5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificationsDigest.items.map((item) => (
            <div
              className="rounded-3xl border border-white/6 bg-white/[0.03] p-4"
              key={item.id}
            >
              <div className="flex items-center justify-between gap-4">
                <Badge variant="outline">{item.course}</Badge>
                <p className="text-muted-foreground text-xs">{item.time}</p>
              </div>
              <p className="mt-3 text-base font-semibold text-white">
                {item.title}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {item.detail}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
