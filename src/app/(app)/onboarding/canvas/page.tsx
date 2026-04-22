import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CanvasOnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="M3 target"
        description="This form is already shaped around the real onboarding flow: Canvas domain, access token, verification, first sync, then redirect to the dashboard."
        eyebrow="Canvas onboarding"
        title="Connect your Canvas account"
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Canvas credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Canvas domain</Label>
              <Input id="domain" placeholder="canvas.school.edu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Access token</Label>
              <Textarea
                id="token"
                placeholder="Paste your Canvas-generated access token here"
              />
            </div>
            <Button className="w-full" size="lg">
              Verify and begin sync
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/70 rounded-[2rem] border-white/8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Security posture</Badge>
              <ShieldCheck className="text-secondary size-5" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              What happens with your token
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm leading-7">
            <p>
              BetterCanvas keeps Canvas API calls server-side. The browser never
              needs direct token access.
            </p>
            <p>
              In M3 the token vault will encrypt tokens at rest with AES-256-GCM
              before saving the CanvasAccount record.
            </p>
            <p>
              First-run sync will immediately pull courses, planner items,
              conversations, calendar events, and announcements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
