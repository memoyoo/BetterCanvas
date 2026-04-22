import Link from "next/link";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authConfigured = Boolean(
  process.env.AUTH_SECRET &&
  process.env.AUTH_RESEND_KEY &&
  process.env.EMAIL_FROM,
);

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-12 sm:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 self-center">
          <Badge>Magic-link auth scaffold</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-[-0.05em] text-white sm:text-6xl">
              Sign in without another password.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-8">
              BetterCanvas uses Auth.js email magic links. The route and config
              stubs are in place now, and the full Resend + Prisma adapter
              wiring lands in milestone 2.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Single account for v1, designed to expand later.",
              "Canvas tokens stay server-side and never reach the browser.",
              "Auth state will gate dashboard, onboarding, and tutor pages.",
              "Vercel deployment path is already reflected in the app structure.",
            ].map((item) => (
              <div
                className="glass-panel text-muted-foreground rounded-3xl p-4 text-sm leading-7"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <Card className="glass-panel rounded-[2rem] border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant={authConfigured ? "secondary" : "outline"}>
                {authConfigured ? "Ready for wiring" : "Needs env vars"}
              </Badge>
              <MailCheck className="text-primary size-5" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Send a magic link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">School email</Label>
              <Input id="email" placeholder="student@school.edu" type="email" />
            </div>
            <Button className="w-full" disabled={!authConfigured} size="lg">
              Email sign-in link
              <ArrowRight className="size-4" />
            </Button>
            <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
              {authConfigured
                ? "Env variables are present. M2 will finish the Prisma adapter and verification-token storage so this flow can go fully live."
                : "Add AUTH_SECRET, AUTH_RESEND_KEY, and EMAIL_FROM to enable the real sign-in path in the next milestone."}
            </div>
            <div className="text-muted-foreground flex items-start gap-3 rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
              <ShieldCheck className="text-secondary mt-1 size-4 shrink-0" />
              <p>
                Need a quick look around first? The prototype shell is already
                browseable from the landing page and dashboard routes.
              </p>
            </div>
            <Button asChild className="w-full" size="sm" variant="secondary">
              <Link href="/dashboard">Open the prototype shell</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
