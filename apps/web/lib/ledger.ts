export type TransactionType = "deposit" | "transfer" | "withdrawal";
export type TransactionStatus = "completed" | "pending" | "failed";
export type DashboardPeriod = "7d" | "30d" | "90d";

export interface LedgerUser {
  fullName: string;
  username: string;
}

export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  detail: string;
}

export interface LedgerState {
  user: LedgerUser;
  availableBalance: number;
  currency: "IDR";
  transactions: LedgerTransaction[];
}

export interface DashboardMetrics {
  moneyIn: number;
  moneyOut: number;
  pendingAmount: number;
  transactionCount: number;
}

export interface CashFlowPoint {
  label: string;
  inflow: number;
  outflow: number;
}

export interface TransactionMixPoint {
  label: string;
  type: TransactionType;
  value: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const DEMO_REFERENCE_DATE = "2026-07-23T12:00:00.000Z";

export const dashboardPeriodDays: Record<DashboardPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const INITIAL_LEDGER_STATE: LedgerState = {
  user: {
    fullName: "Maya Anindita",
    username: "maya_anindita",
  },
  availableBalance: 12_450_000,
  currency: "IDR",
  transactions: [
    {
      id: "TRX-260723-0842",
      type: "deposit",
      amount: 2_500_000,
      status: "completed",
      createdAt: "2026-07-23T07:42:00.000Z",
      detail: "Added from BCA account",
    },
    {
      id: "TRX-260722-1948",
      type: "transfer",
      amount: 475_000,
      status: "completed",
      createdAt: "2026-07-22T12:48:00.000Z",
      detail: "To @rafi_pratama",
    },
    {
      id: "TRX-260722-1015",
      type: "withdrawal",
      amount: 1_200_000,
      status: "pending",
      createdAt: "2026-07-22T03:15:00.000Z",
      detail: "Mandiri ••••0921",
    },
    {
      id: "TRX-260721-1630",
      type: "transfer",
      amount: 325_000,
      status: "failed",
      createdAt: "2026-07-21T09:30:00.000Z",
      detail: "To @naya_putri",
    },
    {
      id: "TRX-260720-0912",
      type: "deposit",
      amount: 5_000_000,
      status: "completed",
      createdAt: "2026-07-20T02:12:00.000Z",
      detail: "Added from BNI account",
    },
    {
      id: "TRX-260718-1411",
      type: "withdrawal",
      amount: 750_000,
      status: "completed",
      createdAt: "2026-07-18T07:11:00.000Z",
      detail: "BCA ••••4418",
    },
    {
      id: "TRX-260716-1725",
      type: "transfer",
      amount: 150_000,
      status: "completed",
      createdAt: "2026-07-16T10:25:00.000Z",
      detail: "To @dimasarya",
    },
    {
      id: "TRX-260715-0805",
      type: "deposit",
      amount: 1_750_000,
      status: "completed",
      createdAt: "2026-07-15T01:05:00.000Z",
      detail: "Added from BRI account",
    },
    {
      id: "TRX-260713-1340",
      type: "deposit",
      amount: 3_200_000,
      status: "completed",
      createdAt: "2026-07-13T06:40:00.000Z",
      detail: "Added from Mandiri account",
    },
    {
      id: "TRX-260711-1820",
      type: "transfer",
      amount: 600_000,
      status: "completed",
      createdAt: "2026-07-11T11:20:00.000Z",
      detail: "To @sarahalim",
    },
    {
      id: "TRX-260708-0915",
      type: "withdrawal",
      amount: 900_000,
      status: "completed",
      createdAt: "2026-07-08T02:15:00.000Z",
      detail: "BNI ••••1830",
    },
    {
      id: "TRX-260705-1645",
      type: "deposit",
      amount: 1_400_000,
      status: "completed",
      createdAt: "2026-07-05T09:45:00.000Z",
      detail: "Added from BCA account",
    },
    {
      id: "TRX-260701-1110",
      type: "transfer",
      amount: 275_000,
      status: "completed",
      createdAt: "2026-07-01T04:10:00.000Z",
      detail: "To @ari_wibowo",
    },
    {
      id: "TRX-260627-1422",
      type: "withdrawal",
      amount: 500_000,
      status: "pending",
      createdAt: "2026-06-27T07:22:00.000Z",
      detail: "BRI ••••7204",
    },
    {
      id: "TRX-260624-0830",
      type: "deposit",
      amount: 2_000_000,
      status: "completed",
      createdAt: "2026-06-24T01:30:00.000Z",
      detail: "Added from BNI account",
    },
    {
      id: "TRX-260622-1910",
      type: "deposit",
      amount: 900_000,
      status: "completed",
      createdAt: "2026-06-22T12:10:00.000Z",
      detail: "Added from BCA account",
    },
    {
      id: "TRX-260619-1018",
      type: "transfer",
      amount: 800_000,
      status: "failed",
      createdAt: "2026-06-19T03:18:00.000Z",
      detail: "To @putri_nabila",
    },
    {
      id: "TRX-260613-1555",
      type: "deposit",
      amount: 4_250_000,
      status: "completed",
      createdAt: "2026-06-13T08:55:00.000Z",
      detail: "Added from Mandiri account",
    },
    {
      id: "TRX-260606-1208",
      type: "withdrawal",
      amount: 1_100_000,
      status: "completed",
      createdAt: "2026-06-06T05:08:00.000Z",
      detail: "BCA ••••4418",
    },
    {
      id: "TRX-260529-1740",
      type: "transfer",
      amount: 425_000,
      status: "completed",
      createdAt: "2026-05-29T10:40:00.000Z",
      detail: "To @fajar_nugraha",
    },
    {
      id: "TRX-260520-0935",
      type: "deposit",
      amount: 2_750_000,
      status: "completed",
      createdAt: "2026-05-20T02:35:00.000Z",
      detail: "Added from BRI account",
    },
    {
      id: "TRX-260512-1624",
      type: "withdrawal",
      amount: 650_000,
      status: "completed",
      createdAt: "2026-05-12T09:24:00.000Z",
      detail: "Mandiri ••••0921",
    },
    {
      id: "TRX-260503-1050",
      type: "transfer",
      amount: 300_000,
      status: "completed",
      createdAt: "2026-05-03T03:50:00.000Z",
      detail: "To @nadia_s",
    },
    {
      id: "TRX-260425-0812",
      type: "deposit",
      amount: 1_200_000,
      status: "completed",
      createdAt: "2026-04-25T01:12:00.000Z",
      detail: "Added from BCA account",
    },
  ],
};

export const transactionLabels: Record<TransactionType, string> = {
  deposit: "Deposit",
  transfer: "Transfer",
  withdrawal: "Withdraw",
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(amount);
}

export function formatTransactionDate(createdAt: string) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date(createdAt));

  return `${formattedDate} WIB`;
}

export function getLedgerReferenceDate(transactions: LedgerTransaction[]) {
  const newestTransactionTimestamp = transactions.reduce(
    (newestTimestamp, transaction) =>
      Math.max(newestTimestamp, new Date(transaction.createdAt).getTime()),
    new Date(DEMO_REFERENCE_DATE).getTime(),
  );

  return new Date(newestTransactionTimestamp);
}

export function getTransactionsForPeriod(
  transactions: LedgerTransaction[],
  period: DashboardPeriod,
  referenceDate = getLedgerReferenceDate(transactions),
) {
  const periodDays = dashboardPeriodDays[period];
  const startTimestamp =
    referenceDate.getTime() - periodDays * DAY_IN_MS;
  const endTimestamp = referenceDate.getTime();

  return transactions.filter((transaction) => {
    const transactionTimestamp = new Date(transaction.createdAt).getTime();

    return (
      transactionTimestamp >= startTimestamp &&
      transactionTimestamp <= endTimestamp
    );
  });
}

export function calculateDashboardMetrics(
  transactions: LedgerTransaction[],
): DashboardMetrics {
  return transactions.reduce<DashboardMetrics>(
    (metrics, transaction) => {
      if (transaction.status === "pending") {
        metrics.pendingAmount += transaction.amount;
      }

      if (transaction.status !== "completed") {
        return metrics;
      }

      if (transaction.type === "deposit") {
        metrics.moneyIn += transaction.amount;
      } else {
        metrics.moneyOut += transaction.amount;
      }

      return metrics;
    },
    {
      moneyIn: 0,
      moneyOut: 0,
      pendingAmount: 0,
      transactionCount: transactions.length,
    },
  );
}

export function createCashFlowData(
  transactions: LedgerTransaction[],
  period: DashboardPeriod,
  referenceDate = getLedgerReferenceDate(transactions),
): CashFlowPoint[] {
  const periodDays = dashboardPeriodDays[period];
  const bucketCount = period === "7d" ? 7 : 6;
  const rangeStart =
    referenceDate.getTime() - periodDays * DAY_IN_MS;
  const rangeEnd = referenceDate.getTime() + 1;
  const bucketDuration = (rangeEnd - rangeStart) / bucketCount;

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = rangeStart + bucketDuration * index;
    const bucketEnd =
      index === bucketCount - 1
        ? rangeEnd
        : rangeStart + bucketDuration * (index + 1);
    const bucketTransactions = transactions.filter((transaction) => {
      const transactionTimestamp = new Date(transaction.createdAt).getTime();

      return (
        transaction.status === "completed" &&
        transactionTimestamp >= bucketStart &&
        transactionTimestamp < bucketEnd
      );
    });
    const label = new Intl.DateTimeFormat("en-US", {
      day: period === "7d" ? undefined : "numeric",
      month: period === "7d" ? undefined : "short",
      timeZone: "Asia/Jakarta",
      weekday: period === "7d" ? "short" : undefined,
    }).format(new Date(bucketStart));

    return bucketTransactions.reduce<CashFlowPoint>(
      (point, transaction) => {
        if (transaction.type === "deposit") {
          point.inflow += transaction.amount;
        } else {
          point.outflow += transaction.amount;
        }

        return point;
      },
      { label, inflow: 0, outflow: 0 },
    );
  });
}

export function createTransactionMix(
  transactions: LedgerTransaction[],
): TransactionMixPoint[] {
  const counts: Record<TransactionType, number> = {
    deposit: 0,
    transfer: 0,
    withdrawal: 0,
  };

  transactions.forEach((transaction) => {
    counts[transaction.type] += 1;
  });

  return (Object.keys(counts) as TransactionType[]).map((type) => ({
    label: transactionLabels[type],
    type,
    value: counts[type],
  }));
}
