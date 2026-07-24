"use client";

import {
  Card,
  Chip,
  Link,
  buttonVariants,
  linkVariants,
} from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CircleSlash2,
  Clock3,
  Landmark,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard-shell";
import { useLedger } from "@/components/ledger-provider";
import {
  formatCurrency,
  formatTransactionDate,
  getTransactionDetail,
  getTransactionTotal,
  transactionLabels,
  type LedgerTransaction,
  type TransactionStatus,
  type TransactionType,
} from "@/lib/ledger";

const transactionIcons: Record<TransactionType, LucideIcon> = {
  deposit: ArrowDownLeft,
  transfer: ArrowUpRight,
  withdrawal: Landmark,
};

const statusColors: Record<
  TransactionStatus,
  "success" | "warning" | "danger"
> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
};

export function TransactionDetailClient({
  transactionId,
}: Readonly<{ transactionId: string }>) {
  const { transactions } = useLedger();
  const transaction = transactions.find(
    (item) => item.id === transactionId,
  );

  if (!transaction) {
    return <TransactionNotFound transactionId={transactionId} />;
  }

  return (
    <DashboardShell
      description={`Complete information for ${transaction.reference}.`}
      title="Transaction details"
    >
      <BackToTransactionsLink />

      <section
        aria-label={`Details for transaction ${transaction.id}`}
        className="grid items-start gap-4 xl:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]"
      >
        <TransactionSummaryCard transaction={transaction} />
        <TransactionInformationCard transaction={transaction} />
      </section>
    </DashboardShell>
  );
}

function BackToTransactionsLink() {
  const linkClassName = linkVariants();

  return (
    <NextLink
      className={linkClassName.base()}
      href="/transactions"
    >
      <Link.Icon aria-hidden="true" className={linkClassName.icon()}>
        <ArrowLeft />
      </Link.Icon>
      Back to transactions
    </NextLink>
  );
}

function TransactionSummaryCard({
  transaction,
}: Readonly<{ transaction: LedgerTransaction }>) {
  const Icon = transactionIcons[transaction.type];
  const isDeposit = transaction.type === "deposit";
  const total = getTransactionTotal(transaction);

  return (
    <Card className="gap-0 bg-surface p-0 xl:sticky xl:top-25">
      <Card.Header className="flex-row items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <StatusChip status={transaction.status} />
      </Card.Header>

      <Card.Content className="px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="text-sm font-medium text-muted">
          {transactionLabels[transaction.type]}
        </p>
        <p
          className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${
            isDeposit ? "text-success" : "text-foreground"
          }`}
        >
          {isDeposit ? "+" : "−"}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="mt-2 text-sm text-muted">
          {getTransactionDetail(transaction)}
        </p>

        <div className="mt-6 rounded-2xl bg-default p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted">Fee</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(transaction.fee)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 border-t border-separator pt-3">
            <span className="text-sm font-medium">
              {isDeposit ? "Total credited" : "Total debited"}
            </span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

function TransactionInformationCard({
  transaction,
}: Readonly<{ transaction: LedgerTransaction }>) {
  return (
    <Card className="gap-0 bg-surface p-0">
      <Card.Header className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <Card.Title className="text-base font-semibold">
          Transaction information
        </Card.Title>
        <Card.Description className="mt-1 text-sm text-muted">
          Identifiers, destination, and processing timeline.
        </Card.Description>
      </Card.Header>

      <Card.Content className="border-t border-separator px-5 py-0 sm:px-6">
        <dl className="divide-y divide-separator">
          <DetailRow label="Transaction ID">
            <span className="font-medium tabular-nums">{transaction.id}</span>
          </DetailRow>
          <DetailRow label="Reference">
            <span className="font-medium tabular-nums">
              {transaction.reference}
            </span>
          </DetailRow>
          <DetailRow label="Type">
            {transactionLabels[transaction.type]}
          </DetailRow>
          <DetailRow label="Status">
            <StatusChip status={transaction.status} />
          </DetailRow>
          <DetailRow label="Amount">
            <span className="font-medium tabular-nums">
              {formatCurrency(transaction.amount)}
            </span>
          </DetailRow>
          <DetailRow label="Fee">
            <span className="font-medium tabular-nums">
              {formatCurrency(transaction.fee)}
            </span>
          </DetailRow>

          {transaction.type === "transfer" ? (
            <DetailRow label="Counterparty">
              <span className="flex flex-col items-start sm:items-end">
                <span className="font-medium">
                  {transaction.counterparty.displayName}
                </span>
                <span className="text-xs text-muted">
                  @{transaction.counterparty.username}
                </span>
              </span>
            </DetailRow>
          ) : (
            <>
              <DetailRow label="Bank">
                {transaction.bankAccount.bankName}
              </DetailRow>
              <DetailRow label="Account">
                <span className="font-medium tabular-nums">
                  {transaction.bankAccount.accountMask}
                </span>
              </DetailRow>
            </>
          )}

          {transaction.note ? (
            <DetailRow label="Note">
              <span className="max-w-md text-start sm:text-end">
                {transaction.note}
              </span>
            </DetailRow>
          ) : null}

          <DetailRow label="Created at">
            <time dateTime={transaction.createdAt}>
              {formatTransactionDate(transaction.createdAt)}
            </time>
          </DetailRow>
          <DetailRow label="Completed at">
            {transaction.completedAt ? (
              <time dateTime={transaction.completedAt}>
                {formatTransactionDate(transaction.completedAt)}
              </time>
            ) : (
              <span className="flex items-center gap-2 text-muted">
                <Clock3 aria-hidden="true" className="size-4" />
                Not completed
              </span>
            )}
          </DetailRow>
        </dl>
      </Card.Content>
    </Card>
  );
}

function DetailRow({
  children,
  label,
}: Readonly<{ children: ReactNode; label: string }>) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[minmax(9rem,0.55fr)_minmax(0,1fr)] sm:items-center">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="min-w-0 text-sm sm:justify-self-end sm:text-end">
        {children}
      </dd>
    </div>
  );
}

function StatusChip({
  status,
}: Readonly<{ status: TransactionStatus }>) {
  return (
    <Chip color={statusColors[status]} size="sm" variant="soft">
      <Chip.Label className="capitalize">{status}</Chip.Label>
    </Chip>
  );
}

function TransactionNotFound({
  transactionId,
}: Readonly<{ transactionId: string }>) {
  const backButtonClassName = buttonVariants({ variant: "secondary" });

  return (
    <DashboardShell
      description="The requested demo transaction is unavailable."
      title="Transaction not found"
    >
      <Card className="mx-auto w-full max-w-xl items-center bg-surface px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-default text-muted">
          <CircleSlash2 aria-hidden="true" className="size-5" />
        </span>
        <Card.Header className="items-center">
          <Card.Title>We couldn&apos;t find this transaction</Card.Title>
          <Card.Description className="max-w-md">
            No transaction with ID{" "}
            <span className="font-medium text-foreground tabular-nums">
              {transactionId}
            </span>{" "}
            exists in this demo session.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <NextLink
            className={backButtonClassName}
            href="/transactions"
          >
            <ReceiptText aria-hidden="true" className="size-4" />
            View all transactions
          </NextLink>
        </Card.Footer>
      </Card>
    </DashboardShell>
  );
}
