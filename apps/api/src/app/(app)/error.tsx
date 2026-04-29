"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[BetterCanvas] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-3xl">
        <AlertTriangle className="size-7" />
      </div>
      <div className="space-y-2">
        <Badge variant="outline">Something went wrong</Badge>
        <h1 className="text-2xl font-bold text-white">
          BetterCanvas hit an unexpected error
        </h1>
        <p className="text-muted-foreground max-w-md text-sm leading-7">
          This page encountered an issue. You can try reloading, or head back to
          the dashboard. If the problem persists, reconnect your Canvas account.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground/60 text-xs font-mono">
            Error reference: {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} size="sm" variant="secondary">
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button asChild size="sm">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
