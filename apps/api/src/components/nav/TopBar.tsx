"use client";

import Link from "next/link";
import { Link2, Search, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { MobileNavigation } from "@/components/nav/AppSidebar";
import { getActiveNavItem } from "@/components/nav/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TopBarProps = {
  connectionBadge: string;
  connectionHref: string;
  connectionLabel: string;
  tutorHref: string;
  tutorLabel: string;
};

export function TopBar({
  connectionBadge,
  connectionHref,
  connectionLabel,
  tutorHref,
  tutorLabel,
}: TopBarProps) {
  const pathname = usePathname();
  const active = getActiveNavItem(pathname);

  return (
    <header className="fixed top-0 right-0 left-0 z-30 border-b border-white/6 bg-[rgba(9,9,13,0.66)] backdrop-blur-2xl lg:left-72">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <MobileNavigation />
          <div>
            <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
              {active.title}
            </p>
            <p className="text-muted-foreground text-sm">
              {active.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="hidden md:inline-flex">{connectionBadge}</Badge>
          <Button size="icon" variant="ghost">
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={connectionHref}>
              <Link2 className="size-4" />
              {connectionLabel}
            </Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex" size="sm">
            <Link href={tutorHref}>
              <Sparkles className="size-4" />
              {tutorLabel}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
