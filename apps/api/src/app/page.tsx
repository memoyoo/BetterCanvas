import Link from "next/link";
import {
  BellDot,
  BookMarked,
  CalendarRange,
  CheckCircle2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const featureCards = [
  {
    title: "Daily oversight that feels calm",
    description:
      "Start with what matters today: due work, at-risk courses, recent changes, and a synced daily briefing grounded in your real Canvas data.",
    icon: Sparkles,
  },
  {
    title: "A calendar that actually helps",
    description:
      "Assignments, planner items, events, and personal tasks live together so you can see the real shape of your week.",
    icon: CalendarRange,
  },
  {
    title: "Inbox and notifications with context",
    description:
      "Synced summaries, digests, and future drafting tools keep you responsive without drowning in activity noise.",
    icon: BellDot,
  },
  {
    title: "Course tutors with guardrails",
    description:
      "Socratic, cited tutoring grounded in course files and pages so students can learn without using the tool to cheat.",
    icon: BookMarked,
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 pt-6 pb-12 sm:px-8 lg:px-10">
        <header className="glass-panel surface-border flex items-center justify-between rounded-full px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="pulse-dot bg-primary/20 text-primary flex size-10 items-center justify-center rounded-full">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-primary text-sm font-semibold tracking-[0.22em] uppercase">
                BetterCanvas
              </p>
              <p className="text-muted-foreground text-sm">
                Midnight Pulse student workspace
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="#download">Get the app</Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-6">
            <Badge>Canvas companion for students</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.04em] text-balance text-white sm:text-6xl lg:text-7xl">
                A calmer way to stay on top of Canvas.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg leading-8 sm:text-xl">
                BetterCanvas is now being rebuilt as a true native app for
                students who want a calmer, more focused way to stay on top of
                Canvas.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild id="download" size="lg">
                <Link href="#download-links">Download coming soon</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard">Web Dashboard</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="glass-panel rounded-3xl p-5">
                <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
                  Current slice
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Native rewrite underway
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  The backend, Canvas sync, and native Expo client are now wired
                  together so BetterCanvas can ship as a real iOS/Android app.
                </p>
              </div>
              <div className="glass-panel rounded-3xl p-5">
                <p className="text-secondary text-sm font-semibold tracking-[0.2em] uppercase">
                  Download posture
                </p>
                <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary size-4" />
                    Native app is the primary product
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary size-4" />
                    API backend stays server-side for Canvas tokens and sync
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="text-primary size-4" />
                    Landing page remains here for downloads and support links
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="surface-border glass-panel rounded-[2rem] border-0 bg-transparent">
              <CardHeader className="space-y-3">
                <Badge variant="secondary">What ships in the app</Badge>
                <CardTitle className="text-2xl font-semibold text-white">
                  BetterCanvas is becoming a native-first student workspace.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featureCards.map(({ title, description, icon: Icon }) => (
                  <div
                    className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                    key={title}
                  >
                    <div className="text-primary mb-3 flex size-11 items-center justify-center rounded-2xl bg-white/6">
                      <Icon className="size-5" />
                    </div>
                    <p className="text-base font-semibold text-white">
                      {title}
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="glass-panel flex items-center justify-between rounded-3xl px-5 py-4">
              <div>
                <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
                  Download
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Coming soon to iOS and Android. Join the waitlist to get
                  notified when BetterCanvas launches.
                </p>
                <div className="mt-3 flex flex-wrap gap-3" id="download-links">
                  <Button disabled size="sm" variant="secondary">
                    App Store — Coming Soon
                  </Button>
                  <Button disabled size="sm" variant="secondary">
                    Google Play — Coming Soon
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/dashboard">Web Preview</Link>
                  </Button>
                </div>
              </div>
              <MessageSquareText className="text-secondary size-8" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
