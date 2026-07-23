"use client";

import { Toast } from "@heroui/react";
import { ThemeProvider } from "next-themes";

import { LedgerProvider } from "@/components/ledger-provider";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey="ledgera-theme"
    >
      <LedgerProvider>{children}</LedgerProvider>
      <Toast.Provider placement="bottom end" />
    </ThemeProvider>
  );
}
