"use client";

import { Avatar, Button, Drawer } from "@heroui/react";
import {
  GraduationCap,
  LayoutDashboard,
  Menu,
  ReceiptText,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useLedger } from "@/components/ledger-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardShell({
  children,
  description,
  headerActions,
  title,
}: Readonly<{
  children: ReactNode;
  description: string;
  title: string;
  headerActions?: ReactNode;
}>) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  return (
    <main className="min-h-svh flex-1 bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-background lg:block">
        <SidebarContent />
      </aside>

      <Drawer.Backdrop
        isOpen={isNavigationOpen}
        onOpenChange={setIsNavigationOpen}
      >
        <Drawer.Content
          className="w-[17rem] max-w-[calc(100vw-2rem)]"
          placement="left"
        >
          <Drawer.Dialog className="h-full p-0">
            <Drawer.CloseTrigger />
            <Drawer.Header className="sr-only">
              <Drawer.Heading>Ledgera navigation</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="h-full p-0">
              <SidebarContent
                onNavigate={() => setIsNavigationOpen(false)}
              />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <div className="min-h-svh lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              aria-label="Open navigation"
              isIconOnly
              size="sm"
              variant="tertiary"
              onPress={() => setIsNavigationOpen(true)}
              className="lg:hidden"
            >
              <Menu aria-hidden="true" />
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                {title}
              </h1>
              <p className="hidden truncate text-xs text-muted sm:block">
                {description}
              </p>
            </div>

            {headerActions}
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}

          <footer className="pt-2 pb-1 text-center text-xs text-muted">
            Ledgera learning workspace · Transactions are simulated.
          </footer>
        </div>
      </div>
    </main>
  );
}

function SidebarContent({
  onNavigate,
}: Readonly<{ onNavigate?: () => void }>) {
  const { user } = useLedger();
  const pathname = usePathname();
  const initials = user.fullName
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("");
  const navigationItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/transactions",
      icon: ReceiptText,
      label: "Transactions",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-4">
      <NextLink
        className="mx-2 flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        href="/dashboard"
        onClick={onNavigate}
      >
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground"
        >
          L
        </span>
        <span className="text-xl font-semibold tracking-tight">Ledgera</span>
      </NextLink>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface px-3 py-3 shadow-surface">
        <Avatar color="accent" size="sm" variant="soft">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.fullName}</p>
          <p className="truncate text-xs text-muted">@{user.username}</p>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="mt-6 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <NextLink
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-10 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                isActive
                  ? "bg-default text-foreground"
                  : "text-muted hover:bg-default hover:text-foreground"
              }`}
              href={item.href}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </NextLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-default p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GraduationCap aria-hidden="true" className="size-4 text-accent" />
          Learning mode
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">
          Explore every flow safely. No real funds are used.
        </p>
      </div>
    </div>
  );
}
