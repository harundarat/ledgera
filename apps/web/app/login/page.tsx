import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Ledgera account.",
};

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 -z-10 rounded-2xl border border-border/70"
      />

      <div className="absolute top-6 right-6 z-10 sm:top-8 sm:right-8">
        <ThemeToggle />
      </div>

      <LoginForm />
    </main>
  );
}
