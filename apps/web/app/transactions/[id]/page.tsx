import type { Metadata } from "next";

import { TransactionDetailClient } from "./transaction-detail-client";

export const metadata: Metadata = {
  title: "Transaction details",
  description: "Review complete information for a Ledgera demo transaction.",
};

export default async function TransactionDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  return <TransactionDetailClient transactionId={id} />;
}
