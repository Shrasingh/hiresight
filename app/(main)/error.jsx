"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for every signed-in page (dashboard, resume,
 * interview, cover letters). Server actions throw short, user-safe messages
 * (see lib/errors.js); this shows them with a retry instead of a blank
 * Next.js error screen.
 */
export default function MainError({ error, reset }) {
  useEffect(() => {
    console.error("[app] route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
