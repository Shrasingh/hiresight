import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import AppClerkProvider from "@/components/clerk-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "hireSight — AI Resume Builder for FAANG-ready students",
  description:
    "Build an ATS-optimized, recruiter-ready resume and land your dream internship or job with hireSight's AI career tools.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AppClerkProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="border-t bg-muted/40 py-12">
              <div className="container mx-auto px-4 text-center text-muted-foreground">
                <p>Made by Shraddha Singh</p>
              </div>
            </footer>
          </AppClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
