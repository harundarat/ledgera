"use client";

import { Link, linkVariants } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";

import { DashboardShell } from "@/components/dashboard-shell";
import { useLedger } from "@/components/ledger-provider";
import { TransactionList } from "@/components/transaction-list";

export function TransactionsClient() {
  const { transactions } = useLedger();
  const linkClassName = linkVariants();

  return (
    <DashboardShell
      description="Review every activity in your simulated Ledgera account."
      title="All transactions"
    >
      <div className="space-y-5">
        <NextLink
          className={linkClassName.base()}
          href="/dashboard"
        >
          <Link.Icon aria-hidden="true" className={linkClassName.icon()}>
            <ArrowLeft />
          </Link.Icon>
          Back to dashboard
        </NextLink>

      </div>

      <section aria-label="All transactions">
        <TransactionList
          description={`${transactions.length} transactions in this demo session.`}
          title="Transaction history"
          transactions={transactions}
        />
      </section>
    </DashboardShell>
  );
}
