import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-3xl">
        <Search className="size-7" />
      </div>
      <div className="space-y-2">
        <Badge variant="outline">404</Badge>
        <h1 className="text-2xl font-bold text-white">Page not found</h1>
        <p className="text-muted-foreground max-w-md text-sm leading-7">
          This route does not exist in BetterCanvas, or the resource you are
          looking for has been removed. Check the URL, or head back to the
          dashboard.
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
