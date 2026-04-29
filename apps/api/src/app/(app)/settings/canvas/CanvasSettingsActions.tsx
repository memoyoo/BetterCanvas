"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  disconnectCanvasConnection,
  initialCanvasSettingsActionState,
  resyncCanvasConnection,
} from "@/app/(app)/settings/canvas/actions";
import { Button } from "@/components/ui/button";

type CanvasSettingsActionsProps = {
  connected: boolean;
  syncDisabledReason?: string | null;
};

function ActionButton({
  children,
  disabled,
  variant,
}: {
  children: ReactNode;
  disabled: boolean;
  variant?: "default" | "destructive" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full"
      disabled={disabled || pending}
      size="sm"
      variant={variant}
    >
      {pending ? "Working..." : children}
    </Button>
  );
}

export function CanvasSettingsActions({
  connected,
  syncDisabledReason,
}: CanvasSettingsActionsProps) {
  const [syncState, syncAction] = useActionState(
    resyncCanvasConnection,
    initialCanvasSettingsActionState,
  );
  const [disconnectState, disconnectAction] = useActionState(
    disconnectCanvasConnection,
    initialCanvasSettingsActionState,
  );
  const syncDisabled = Boolean(syncDisabledReason) || !connected;
  const disconnectDisabled = !connected;

  return (
    <div className="space-y-4">
      {syncDisabledReason ? (
        <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
          {syncDisabledReason}
        </div>
      ) : null}
      {syncState.error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          {syncState.error}
        </div>
      ) : null}
      <form action={syncAction}>
        <ActionButton disabled={syncDisabled} variant="secondary">
          Sync now
        </ActionButton>
      </form>
      {disconnectState.error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          {disconnectState.error}
        </div>
      ) : null}
      <form action={disconnectAction}>
        <ActionButton disabled={disconnectDisabled} variant="destructive">
          Disconnect account
        </ActionButton>
      </form>
    </div>
  );
}
