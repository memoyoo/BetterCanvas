import { ShieldCheck } from "lucide-react";

import { CanvasOnboardingForm } from "@/app/(app)/onboarding/canvas/CanvasOnboardingForm";
import { PageHeader } from "@/components/nav/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { magicLinkConfigured } from "@/lib/auth";
import {
  canvasSyncConfigured,
  getCanvasSyncSetupIssues,
} from "@/server/canvas/service";
import { getCurrentUser } from "@/server/session";

export default async function CanvasOnboardingPage() {
  const user = await getCurrentUser();
  const existingAccount = user?.canvasAccount ?? null;
  const syncSetupIssues = getCanvasSyncSetupIssues();
  const disabledReason = !magicLinkConfigured
    ? "Add DATABASE_URL, AUTH_SECRET, AUTH_RESEND_KEY, and EMAIL_FROM so BetterCanvas can authenticate a real user before connecting Canvas."
    : syncSetupIssues.length > 0
      ? `Add ${syncSetupIssues.join(" and ")} before connecting Canvas.`
      : !user
        ? "Sign in first to connect a Canvas account."
        : null;

  return (
    <div className="space-y-6">
      <PageHeader
        badge={canvasSyncConfigured ? "Live connection" : "Setup required"}
        description="BetterCanvas now verifies your Canvas token on the server, encrypts it at rest, runs an initial sync, and sends you back to the live dashboard."
        eyebrow="Canvas onboarding"
        title={
          existingAccount ? "Update your Canvas connection" : "Connect your Canvas account"
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              {existingAccount ? "Refresh Canvas credentials" : "Canvas credentials"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CanvasOnboardingForm
              defaultDomain={existingAccount?.domain ?? null}
              disabledReason={disabledReason}
              hasExistingConnection={Boolean(existingAccount)}
            />
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
              gets direct access to the Canvas token.
            </p>
            <p>
              Tokens are encrypted at rest with AES-256-GCM before the
              `CanvasAccount` record is written.
            </p>
            <p>
              The first sync currently pulls your Canvas user profile, active
              courses, planner items, recent activity, and inbox thread list so
              the app shell can switch off starter data.
            </p>
            {existingAccount ? (
              <div className="rounded-3xl border border-white/6 bg-white/[0.03] p-4">
                Connected domain: <span className="text-white">{existingAccount.domain}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
