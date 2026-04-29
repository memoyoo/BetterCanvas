import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-5 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="pulse-dot bg-primary/20 text-primary flex size-10 items-center justify-center rounded-full">
              <Sparkles className="size-4" />
            </div>
            <p className="text-primary text-sm font-semibold tracking-[0.22em] uppercase">
              BetterCanvas
            </p>
          </div>
          <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-3xl">
            <Search className="size-7" />
          </div>
          <div className="space-y-2">
            <Badge variant="outline">404</Badge>
            <h1 className="text-3xl font-bold text-white">Page not found</h1>
            <p className="text-muted-foreground max-w-md text-sm leading-7">
              The page you are looking for does not exist. It may have been
              moved, or the URL may be incorrect.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="secondary">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
