"use client";

import { Card, Chip, Separator, Table } from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  formatCurrency,
  formatTransactionDate,
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

interface TransactionListProps {
  description: string;
  title: string;
  transactions: LedgerTransaction[];
  action?: ReactNode;
}

export function TransactionList({
  action,
  description,
  title,
  transactions,
}: Readonly<TransactionListProps>) {
  return (
    <Card className="gap-0 overflow-hidden bg-surface p-0">
      <Card.Header className="flex-row items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <div className="min-w-0 space-y-1">
          <Card.Title className="text-base font-semibold">
            {title}
          </Card.Title>
          <Card.Description className="truncate text-sm text-muted">
            {description}
          </Card.Description>
        </div>
        <div className="shrink-0">{action}</div>
      </Card.Header>

      <Card.Content className="border-t border-separator p-0">
        <div className="hidden md:block">
          <Table className="rounded-none bg-transparent p-0">
            <Table.ScrollContainer>
              <Table.Content
                aria-label={title}
                className="min-w-195"
              >
                <Table.Header className="bg-surface">
                  <Table.Column className="bg-surface" isRowHeader>
                    ID
                  </Table.Column>
                  <Table.Column className="bg-surface">
                    Transaction
                  </Table.Column>
                  <Table.Column className="bg-surface text-end">
                    Amount
                  </Table.Column>
                  <Table.Column className="bg-surface">Status</Table.Column>
                  <Table.Column className="bg-surface">Date</Table.Column>
                </Table.Header>
                <Table.Body
                  items={transactions}
                  renderEmptyState={() => (
                    <div className="p-8 text-center text-sm text-muted">
                      No transactions in this period.
                    </div>
                  )}
                >
                  {(transaction) => (
                    <Table.Row id={transaction.id}>
                      <Table.Cell className="font-medium tabular-nums">
                        {transaction.id}
                      </Table.Cell>
                      <Table.Cell>
                        <TransactionSummary transaction={transaction} />
                      </Table.Cell>
                      <Table.Cell className="text-end">
                        <TransactionAmount transaction={transaction} />
                      </Table.Cell>
                      <Table.Cell>
                        <TransactionStatusChip status={transaction.status} />
                      </Table.Cell>
                      <Table.Cell>
                        <time
                          className="whitespace-nowrap text-xs text-muted"
                          dateTime={transaction.createdAt}
                        >
                          {formatTransactionDate(transaction.createdAt)}
                        </time>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>

        <div className="md:hidden">
          {transactions.length > 0 ? (
            <ul aria-label={title}>
              {transactions.map((transaction, index) => (
                <li key={transaction.id}>
                  {index > 0 ? (
                    <Separator className="mx-5 w-auto" />
                  ) : null}
                  <article className="space-y-4 px-5 py-4">
                    <TransactionSummary transaction={transaction} />
                    <div className="flex items-center justify-between gap-3">
                      <TransactionAmount transaction={transaction} />
                      <TransactionStatusChip status={transaction.status} />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                      <span className="font-medium tabular-nums">
                        {transaction.id}
                      </span>
                      <time dateTime={transaction.createdAt}>
                        {formatTransactionDate(transaction.createdAt)}
                      </time>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No transactions in this period.
            </p>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

function TransactionSummary({
  transaction,
}: Readonly<{ transaction: LedgerTransaction }>) {
  const Icon = transactionIcons[transaction.type];

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-default text-foreground">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {transactionLabels[transaction.type]}
        </p>
        <p className="max-w-64 truncate text-xs text-muted">
          {transaction.detail}
        </p>
      </div>
    </div>
  );
}

function TransactionAmount({
  transaction,
}: Readonly<{ transaction: LedgerTransaction }>) {
  const isDeposit = transaction.type === "deposit";

  return (
    <span
      className={`whitespace-nowrap text-sm font-semibold tabular-nums ${isDeposit ? "text-success" : "text-foreground"
        }`}
    >
      {isDeposit ? "+" : "−"}
      {formatCurrency(transaction.amount)}
    </span>
  );
}

function TransactionStatusChip({
  status,
}: Readonly<{ status: TransactionStatus }>) {
  return (
    <Chip color={statusColors[status]} size="sm" variant="soft">
      <Chip.Label className="capitalize">{status}</Chip.Label>
    </Chip>
  );
}
