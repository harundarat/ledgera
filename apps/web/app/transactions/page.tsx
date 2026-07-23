import type { Metadata } from "next";

import { TransactionsClient } from "./transactions-client";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Review all activity in your Ledgera demo account.",
};

export default function TransactionsPage() {
  return <TransactionsClient />;
}
