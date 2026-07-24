"use client";

import { Button, Card, buttonVariants } from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Landmark,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { useMemo, useState } from "react";

import {
  CashFlowChart,
  TransactionMixChart,
} from "@/components/dashboard-charts";
import { DashboardShell } from "@/components/dashboard-shell";
import { useLedger } from "@/components/ledger-provider";
import { TransactionDialog } from "@/components/transaction-dialog";
import { TransactionList } from "@/components/transaction-list";
import {
  calculateDashboardMetrics,
  createCashFlowData,
  createTransactionMix,
  formatCurrency,
  getLedgerReferenceDate,
  getTransactionsForPeriod,
  type DashboardPeriod,
  type TransactionType,
} from "@/lib/ledger";

const periodOptions: Array<{
  label: string;
  value: DashboardPeriod;
}> = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

const periodDescriptions: Record<DashboardPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export function DashboardClient() {
  const { availableBalance, transactions, user } = useLedger();
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [activeDialog, setActiveDialog] =
    useState<TransactionType | null>(null);
  const linkButtonClassName = buttonVariants({
    size: "sm",
    variant: "secondary",
  });
  const referenceDate = useMemo(
    () => getLedgerReferenceDate(transactions),
    [transactions],
  );
  const filteredTransactions = useMemo(
    () => getTransactionsForPeriod(transactions, period, referenceDate),
    [period, referenceDate, transactions],
  );
  const metrics = useMemo(
    () => calculateDashboardMetrics(filteredTransactions),
    [filteredTransactions],
  );
  const cashFlowData = useMemo(
    () => createCashFlowData(filteredTransactions, period, referenceDate),
    [filteredTransactions, period, referenceDate],
  );
  const transactionMix = useMemo(
    () => createTransactionMix(filteredTransactions),
    [filteredTransactions],
  );
  const periodDescription = periodDescriptions[period];

  return (
    <DashboardShell
      description="Monitor your balance, cash flow, and latest account activity."
      mobileDock={
        <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 sm:hidden">
          <div className="mx-auto max-w-sm rounded-3xl border border-border bg-surface/95 p-2 shadow-overlay backdrop-blur-xl">
            <TransactionActions
              layout="dock"
              onSelect={(type) => setActiveDialog(type)}
            />
          </div>
        </div>
      }
      title={`Welcome back, ${user.fullName.split(" ")[0]}.`}
    >
      <section
        aria-label="Dashboard controls"
        className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
      >
        <div
          aria-label="Dashboard period"
          className="flex w-fit rounded-full bg-default p-1"
          role="group"
        >
          {periodOptions.map((option) => {
            const isSelected = option.value === period;

            return (
              <Button
                key={option.value}
                aria-pressed={isSelected}
                size="sm"
                variant={isSelected ? "secondary" : "ghost"}
                onPress={() => setPeriod(option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </div>

        <TransactionActions
          layout="inline"
          onSelect={(type) => setActiveDialog(type)}
        />
      </section>

      <section
        aria-label="Account metrics"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <MetricCard
          description="Available now"
          icon={WalletCards}
          label="Available balance"
          mobileLayout="featured"
          value={formatCurrency(availableBalance)}
        />
        <MetricCard
          description={`Completed deposits · ${periodDescription}`}
          icon={ArrowDownLeft}
          label="Money in"
          mobileLayout="compact"
          value={formatCurrency(metrics.moneyIn)}
        />
        <MetricCard
          description={`Completed debits · ${periodDescription}`}
          icon={ArrowUpRight}
          label="Money out"
          mobileLayout="compact"
          value={formatCurrency(metrics.moneyOut)}
        />
        <MetricCard
          description={`${metrics.transactionCount} activities · ${periodDescription}`}
          icon={Clock3}
          label="Pending amount"
          mobileLayout="horizontal"
          value={formatCurrency(metrics.pendingAmount)}
        />
      </section>

      <section
        aria-label="Account analytics"
        className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.8fr)]"
      >
        <Card className="gap-0 bg-surface p-0">
          <Card.Header className="flex-row items-start justify-between gap-4 px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
            <div>
              <Card.Title className="text-base font-semibold">
                Cash flow
              </Card.Title>
              <Card.Description className="mt-1 text-sm text-muted">
                Completed money movement · {periodDescription}
              </Card.Description>
            </div>
            <div className="hidden items-center gap-4 text-xs text-muted sm:flex">
              <ChartLegend color="var(--chart-primary)" label="Money in" />
              <ChartLegend color="var(--chart-secondary)" label="Money out" />
            </div>
          </Card.Header>
          <Card.Content className="px-3 pt-2 pb-4 sm:px-5">
            <CashFlowChart data={cashFlowData} />
          </Card.Content>
        </Card>

        <Card className="gap-0 bg-surface p-0">
          <Card.Header className="px-5 pt-5 pb-0 sm:px-6 sm:pt-6">
            <Card.Title className="text-base font-semibold">
              Transaction mix
            </Card.Title>
            <Card.Description className="mt-1 text-sm text-muted">
              Activity by transaction type · {periodDescription}
            </Card.Description>
          </Card.Header>
          <Card.Content className="px-5 pt-2 pb-5 sm:px-6">
            <TransactionMixChart data={transactionMix} />
          </Card.Content>
        </Card>
      </section>

      <section aria-label="Recent transactions">
        <TransactionList
          action={
            <NextLink
              aria-label="View all transactions"
              className={linkButtonClassName}
              href="/transactions"
            >
              <span className="hidden sm:inline">View all</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </NextLink>
          }
          description={`Five latest activities · ${periodDescription}`}
          title="Recent transactions"
          transactions={filteredTransactions.slice(0, 5)}
        />
      </section>

      {activeDialog ? (
        <TransactionDialog
          isOpen
          type={activeDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setActiveDialog(null);
            }
          }}
        />
      ) : null}
    </DashboardShell>
  );
}

function TransactionActions({
  layout,
  onSelect,
}: Readonly<{
  layout: "dock" | "inline";
  onSelect: (type: TransactionType) => void;
}>) {
  const isDock = layout === "dock";
  const dockButtonClassName =
    "h-14 w-full flex-col gap-0.5 px-1 text-xs";
  const depositButtonClassName = `${
    isDock ? dockButtonClassName : ""
  } [--button-bg:var(--accent-strong)] [--button-bg-hover:var(--accent-strong-hover)] [--button-bg-pressed:var(--accent-strong-hover)]`;

  return (
    <div
      aria-label="Transaction actions"
      className={
        isDock
          ? "grid grid-cols-3 gap-1"
          : "hidden items-center gap-2 sm:flex"
      }
      role="group"
    >
      <Button
        className={depositButtonClassName}
        fullWidth={isDock}
        size={isDock ? "lg" : "sm"}
        onPress={() => onSelect("deposit")}
      >
        <ArrowDownLeft aria-hidden="true" />
        <span>Deposit</span>
      </Button>
      <Button
        className={isDock ? dockButtonClassName : undefined}
        fullWidth={isDock}
        size={isDock ? "lg" : "sm"}
        variant="secondary"
        onPress={() => onSelect("transfer")}
      >
        <ArrowUpRight aria-hidden="true" />
        <span>Transfer</span>
      </Button>
      <Button
        className={isDock ? dockButtonClassName : undefined}
        fullWidth={isDock}
        size={isDock ? "lg" : "sm"}
        variant="secondary"
        onPress={() => onSelect("withdrawal")}
      >
        <Landmark aria-hidden="true" />
        <span>Withdraw</span>
      </Button>
    </div>
  );
}

function MetricCard({
  description,
  icon: Icon,
  label,
  mobileLayout,
  value,
}: Readonly<{
  description: string;
  icon: LucideIcon;
  label: string;
  mobileLayout: "compact" | "featured" | "horizontal";
  value: string;
}>) {
  const cardLayoutClasses = {
    compact: "col-span-1",
    featured: "col-span-2 sm:col-span-1",
    horizontal: "col-span-2 sm:col-span-1",
  }[mobileLayout];
  const contentLayoutClasses =
    mobileLayout === "horizontal"
      ? "px-4 py-3.5 pr-14 sm:p-5"
      : "p-4 sm:p-5";
  const valueSizeClasses = {
    compact:
      "text-[clamp(0.8125rem,4.2vw,1.125rem)] sm:text-2xl",
    featured: "text-xl sm:text-2xl",
    horizontal: "text-lg sm:text-2xl",
  }[mobileLayout];
  const valueSpacingClasses =
    mobileLayout === "horizontal" ? "mt-1.5 sm:mt-2" : "mt-2";
  const iconPositionClasses =
    mobileLayout === "horizontal"
      ? "right-4 top-1/2 -translate-y-1/2 sm:right-5 sm:top-5 sm:translate-y-0"
      : "right-4 top-4 sm:right-5 sm:top-5";

  return (
    <Card
      className={`relative min-w-0 gap-0 overflow-hidden rounded-3xl bg-surface p-0 ${cardLayoutClasses}`}
    >
      <Card.Content className={`min-w-0 ${contentLayoutClasses}`}>
        <p className="truncate pr-9 text-xs text-muted sm:text-sm">
          {label}
        </p>
        <p
          className={`truncate font-semibold tracking-tight tabular-nums ${valueSpacingClasses} ${valueSizeClasses}`}
        >
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] leading-4 text-muted sm:mt-2 sm:text-xs">
          {description}
        </p>
        <span
          className={`absolute flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground sm:size-8 ${iconPositionClasses}`}
        >
          <Icon aria-hidden="true" className="size-3.5 sm:size-4" />
        </span>
      </Card.Content>
    </Card>
  );
}

function ChartLegend({
  color,
  label,
}: Readonly<{ color: string; label: string }>) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
