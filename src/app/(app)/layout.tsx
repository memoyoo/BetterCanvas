import type { ReactNode } from "react";

import { AppSidebar } from "@/components/nav/AppSidebar";
import { TopBar } from "@/components/nav/TopBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <TopBar />
      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-10 lg:pt-28">
          {children}
        </main>
      </div>
    </div>
  );
}
