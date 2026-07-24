"use client";

import { Card, Chip, Separator, Table } from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  formatCurrency,
  formatTransactionDate,
  getTransactionDetail,
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
  const router = useRouter();

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
                onRowAction={(key) =>
                  router.push(
                    `/transactions/${encodeURIComponent(String(key))}`,
                  )
                }
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
                    <Table.Row
                      className={({ isHovered, isPressed }) =>
                        `cursor-pointer transition-colors duration-150 ${
                          isPressed
                            ? "bg-accent-soft"
                            : isHovered
                              ? "bg-default"
                              : ""
                        }`
                      }
                      id={transaction.id}
                    >
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
                  <NextLink
                    aria-label={`View ${transactionLabels[transaction.type]} transaction ${transaction.id}`}
                    className="group block rounded-2xl transition-[background-color,transform] duration-150 hover:bg-default active:scale-[0.995] active:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus motion-reduce:transform-none"
                    href={`/transactions/${encodeURIComponent(transaction.id)}`}
                  >
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
                        <span className="flex items-center gap-1">
                          <time dateTime={transaction.createdAt}>
                            {formatTransactionDate(transaction.createdAt)}
                          </time>
                          <ChevronRight
                            aria-hidden="true"
                            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-active:translate-x-1 motion-reduce:transform-none"
                          />
                        </span>
                      </div>
                    </article>
                  </NextLink>
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
          {getTransactionDetail(transaction)}
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
