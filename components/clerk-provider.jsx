"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

/**
 * Wraps Clerk so its hosted UI (sign-in, sign-up, user button, settings)
 * follows the active app theme. Uses `resolvedTheme` so the "system"
 * setting maps to the concrete light/dark value.
 */
export default function AppClerkProvider({ children }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "hsl(250, 84%, 58%)",
        },
        elements: {
          card: "shadow-premium",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
