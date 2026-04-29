import { BellDot, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/server/session";
import { getNotificationsView } from "@/server/canvas/view-models";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const notifications = await getNotificationsView(user?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        badge={notifications.connected ? "Live digest" : "Connect Canvas"}
        description={
          notifications.connected
            ? "The notifications page is backed by synced Canvas activity and recent change data."
            : "Connect Canvas to generate a live summary of recent activity and announcements."
        }
        eyebrow="Change awareness"
        title="Notifications"
      />

      <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge>Today at a glance</Badge>
            <Sparkles className="text-primary size-5" />
          </div>
          <CardTitle className="text-xl font-semibold text-white">
            Sync summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-5 text-sm leading-7">
            {notifications.summary}
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
          {notifications.items.length > 0 ? (
            notifications.items.map((item) => (
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
            ))
          ) : (
            <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
              {notifications.connected
                ? "No recent Canvas activity was available in the latest sync."
                : "Connect Canvas to populate the recent feed."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
