import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";

import { auth, magicLinkConfigured, signIn } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function sendMagicLink(formData: FormData) {
  "use server";

  if (!magicLinkConfigured) {
    return;
  }

  const email = formData.get("email");

  if (typeof email !== "string" || email.trim().length === 0) {
    return;
  }

  await signIn("resend", {
    email: email.trim(),
    redirectTo: "/dashboard",
  });
}

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-5 py-12 sm:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 self-center">
          <Badge>Magic-link auth foundation</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-[-0.05em] text-white sm:text-6xl">
              Sign in without another password.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-8">
              BetterCanvas uses Auth.js email magic links backed by Prisma and
              Resend. When the required env vars are present, this screen sends
              a real sign-in link and hands the user off to the app shell.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Single account for v1, designed to expand later.",
              "Canvas tokens stay server-side and never reach the browser.",
              "Auth.js sessions now support a real Prisma-backed user model.",
              "Dashboard and onboarding can start reading server session helpers next.",
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
              <Badge variant={magicLinkConfigured ? "secondary" : "outline"}>
                {magicLinkConfigured ? "Magic link ready" : "Needs env vars"}
              </Badge>
              <MailCheck className="text-primary size-5" />
            </div>
            <CardTitle className="text-2xl font-semibold text-white">
              Send a magic link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={sendMagicLink} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">School email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="student@school.edu"
                  required
                  type="email"
                />
              </div>
              <Button className="w-full" disabled={!magicLinkConfigured} size="lg">
                Email sign-in link
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
              {magicLinkConfigured
                ? "Env variables are present. The Auth.js route now supports real Prisma-backed magic links and will redirect authenticated users into the app."
                : "Add DATABASE_URL, AUTH_SECRET, AUTH_RESEND_KEY, and EMAIL_FROM to enable the live sign-in path."}
            </div>
            <div className="text-muted-foreground flex items-start gap-3 rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
              <ShieldCheck className="text-secondary mt-1 size-4 shrink-0" />
              <p>
                Need a quick look around first? The app shell is already
                browseable from the landing page and dashboard routes.
              </p>
            </div>
            <Button asChild className="w-full" size="sm" variant="secondary">
              <Link href="/dashboard">Open the app shell</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
