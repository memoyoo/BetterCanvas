import { KeyRound, Unplug } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CanvasSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Connection settings"
        description="The settings surface is stubbed for the upcoming disconnect flow and future sync controls. Once CanvasAccount exists, this page will reflect connection health and last sync metadata."
        eyebrow="Settings"
        title="Canvas connection"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>Account state</Badge>
              <KeyRound className="text-primary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              No Canvas account connected yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm leading-7">
            <p>
              Once onboarding is complete, this page will show the domain,
              label, and last successful sync for the connected Canvas account.
            </p>
            <p>
              M3 will also add the disconnect endpoint that deletes the
              CanvasAccount row and cached sync data in one action.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Danger zone</Badge>
              <Unplug className="text-muted-foreground size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Disconnect Canvas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4 text-sm leading-7">
            <p>
              This button stays disabled until the disconnect API route and
              server action are implemented.
            </p>
            <Button className="w-full" disabled size="sm" variant="destructive">
              Disconnect account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
