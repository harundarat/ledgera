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

        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Button
            size="sm"
            onPress={() => setActiveDialog("deposit")}
          >
            <ArrowDownLeft aria-hidden="true" />
            Deposit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => setActiveDialog("transfer")}
          >
            <ArrowUpRight aria-hidden="true" />
            Transfer
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => setActiveDialog("withdrawal")}
          >
            <Landmark aria-hidden="true" />
            Withdraw
          </Button>
        </div>
      </section>

      <section
        aria-label="Account metrics"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          description="Available now"
          icon={WalletCards}
          label="Available balance"
          value={formatCurrency(availableBalance)}
        />
        <MetricCard
          description={`Completed deposits · ${periodDescription}`}
          icon={ArrowDownLeft}
          label="Money in"
          value={formatCurrency(metrics.moneyIn)}
        />
        <MetricCard
          description={`Completed debits · ${periodDescription}`}
          icon={ArrowUpRight}
          label="Money out"
          value={formatCurrency(metrics.moneyOut)}
        />
        <MetricCard
          description={`${metrics.transactionCount} activities · ${periodDescription}`}
          icon={Clock3}
          label="Pending amount"
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

function MetricCard({
  description,
  icon: Icon,
  label,
  value,
}: Readonly<{
  description: string;
  icon: LucideIcon;
  label: string;
  value: string;
}>) {
  return (
    <Card className="min-w-0 gap-0 bg-surface p-0">
      <Card.Header className="flex-row items-start justify-between gap-3 px-5 pt-5 pb-3">
        <Card.Description className="text-sm text-muted">
          {label}
        </Card.Description>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </Card.Header>
      <Card.Content className="px-5 pb-5">
        <p className="truncate text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
          {value}
        </p>
        <p className="mt-2 truncate text-xs text-muted">{description}</p>
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
