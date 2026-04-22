import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        "text-foreground placeholder:text-muted-foreground/80 focus-visible:border-primary/60 focus-visible:ring-primary/20 flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-inner transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
