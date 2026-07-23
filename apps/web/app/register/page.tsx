import type { Metadata } from "next";

import { ThemeToggle } from "@/components/theme-toggle";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Ledgera account.",
};

export default function RegisterPage() {
  return (
    <main className="relative isolate flex min-h-svh flex-1 items-center justify-center overflow-x-hidden bg-background px-4 py-12 text-foreground sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 -z-10 rounded-2xl border border-border/70"
      />

      <div className="absolute top-6 right-6 z-10 sm:top-8 sm:right-8">
        <ThemeToggle />
      </div>

      <RegisterForm />
    </main>
  );
}
