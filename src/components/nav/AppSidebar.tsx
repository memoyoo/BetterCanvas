"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Link2, Menu, Sparkles } from "lucide-react";

import { appNavigation } from "@/components/nav/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-2", mobile && "space-y-3")}>
      {appNavigation.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            className={cn(
              "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all",
              isActive
                ? "border-primary/20 bg-primary/12 text-white shadow-[0_12px_32px_rgba(124,92,255,0.18)]"
                : "text-muted-foreground border-transparent bg-transparent hover:border-white/6 hover:bg-white/5 hover:text-white",
            )}
            href={item.href}
            key={item.href}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl border text-inherit transition-colors",
                isActive
                  ? "border-primary/20 bg-primary/10"
                  : "border-white/8 bg-white/4 group-hover:border-white/12",
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-muted-foreground truncate text-xs">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="icon" variant="secondary">
          <Menu className="size-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="max-w-[92vw] border-r border-l-0 border-white/10"
        side="left"
      >
        <SheetHeader>
          <Badge>Prototype shell</Badge>
          <SheetTitle>BetterCanvas</SheetTitle>
          <SheetDescription>
            Dashboard, planning, inbox, tutor, onboarding, and settings routes
            are all wired for the M1 scaffold.
          </SheetDescription>
        </SheetHeader>
        <NavLinks mobile />
      </SheetContent>
    </Sheet>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/6 bg-[rgba(7,7,12,0.74)] px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="pulse-dot bg-primary/15 text-primary flex size-11 items-center justify-center rounded-2xl">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-primary text-sm font-semibold tracking-[0.24em] uppercase">
            BetterCanvas
          </p>
          <p className="text-muted-foreground text-sm">Canvas, but calmer.</p>
        </div>
      </div>

      <NavLinks />

      <div className="mt-auto space-y-4">
        <div className="surface-border glass-panel rounded-[1.75rem] p-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">Canvas status</Badge>
            <Link2 className="text-secondary size-4" />
          </div>
          <p className="mt-4 text-lg font-semibold text-white">
            Connect a Canvas token next
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Onboarding is scaffolded and ready for the M3 verify flow. Tokens
            stay server-side once the vault lands.
          </p>
          <Button asChild className="mt-4 w-full" size="sm">
            <Link href="/onboarding/canvas">
              Open onboarding
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-3">
          <Avatar>
            <AvatarFallback>BC</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              BetterCanvas Student
            </p>
            <p className="text-muted-foreground truncate text-xs">
              Magic-link auth gets fully wired in M2
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
