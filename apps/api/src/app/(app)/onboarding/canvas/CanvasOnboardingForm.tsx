"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialCanvasOnboardingState,
  submitCanvasConnection,
} from "@/app/(app)/onboarding/canvas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CanvasOnboardingFormProps = {
  defaultDomain?: string | null;
  disabledReason?: string | null;
  hasExistingConnection: boolean;
};

function SubmitButton({
  disabled,
  hasExistingConnection,
}: {
  disabled: boolean;
  hasExistingConnection: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={disabled || pending} size="lg">
      {pending
        ? "Syncing Canvas..."
        : hasExistingConnection
          ? "Update connection and sync"
          : "Verify and begin sync"}
    </Button>
  );
}

export function CanvasOnboardingForm({
  defaultDomain,
  disabledReason,
  hasExistingConnection,
}: CanvasOnboardingFormProps) {
  const [state, formAction] = useActionState(
    submitCanvasConnection,
    initialCanvasOnboardingState,
  );
  const disabled = Boolean(disabledReason);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="domain">Canvas domain</Label>
        <Input
          defaultValue={defaultDomain ?? ""}
          id="domain"
          name="domain"
          placeholder="canvas.school.edu"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="token">Access token</Label>
        <Textarea
          id="token"
          name="token"
          placeholder="Paste your Canvas-generated access token here"
          required
          rows={6}
        />
      </div>
      {disabledReason ? (
        <div className="text-muted-foreground rounded-3xl border border-white/6 bg-white/[0.03] p-4 text-sm leading-7">
          {disabledReason}
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
          {state.error}
        </div>
      ) : null}
      <SubmitButton
        disabled={disabled}
        hasExistingConnection={hasExistingConnection}
      />
    </form>
  );
}
