import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
              {title}
            </h1>
            {badge ? <Badge>{badge}</Badge> : null}
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm leading-7 sm:text-base">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
