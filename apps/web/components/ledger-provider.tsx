"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  DEMO_REFERENCE_DATE,
  INITIAL_LEDGER_STATE,
  getTransactionFee,
  type LedgerState,
  type LedgerTransaction,
  type LedgerTransactionDraft,
} from "@/lib/ledger";

interface DepositInput {
  amount: number;
}

interface TransferInput {
  amount: number;
  recipient: string;
}

interface WithdrawInput {
  accountNumber: string;
  amount: number;
  bankName: string;
}

type LedgerActionResult =
  | { ok: true }
  | { ok: false; error: string };

interface LedgerContextValue extends LedgerState {
  deposit: (input: DepositInput) => LedgerActionResult;
  transfer: (input: TransferInput) => LedgerActionResult;
  withdraw: (input: WithdrawInput) => LedgerActionResult;
}

const LedgerContext = createContext<LedgerContextValue | null>(null);

function createTransactionId(sequence: number) {
  return `TRX-${Date.now().toString(36).toUpperCase()}-${sequence
    .toString()
    .padStart(2, "0")}`;
}

export function LedgerProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [ledger, setLedger] = useState<LedgerState>(INITIAL_LEDGER_STATE);
  const transactionSequence = useRef(1);

  const buildTransaction = useCallback(
    (transaction: LedgerTransactionDraft): LedgerTransaction => {
      const id = createTransactionId(transactionSequence.current);
      const createdAt = new Date(
        new Date(DEMO_REFERENCE_DATE).getTime() +
          transactionSequence.current * 60_000,
      );
      const nextTransaction = {
        ...transaction,
        id,
        reference: `LDG-${id.slice(4)}`,
        fee: getTransactionFee(transaction.type),
        status: "completed" as const,
        createdAt: createdAt.toISOString(),
        completedAt: new Date(createdAt.getTime() + 60_000).toISOString(),
      };

      transactionSequence.current += 1;
      return nextTransaction as LedgerTransaction;
    },
    [],
  );

  const deposit = useCallback(
    ({ amount }: DepositInput): LedgerActionResult => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, error: "Enter an amount greater than zero." };
      }

      const transaction = buildTransaction({
        amount,
        bankAccount: {
          accountMask: "•••• 4418",
          bankName: "BCA",
        },
        note: "Demo deposit",
        type: "deposit",
      });

      setLedger((currentLedger) => ({
        ...currentLedger,
        availableBalance: currentLedger.availableBalance + amount,
        transactions: [transaction, ...currentLedger.transactions],
      }));

      return { ok: true };
    },
    [buildTransaction],
  );

  const transfer = useCallback(
    ({ amount, recipient }: TransferInput): LedgerActionResult => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, error: "Enter an amount greater than zero." };
      }

      if (amount > ledger.availableBalance) {
        return { ok: false, error: "Your available balance is too low." };
      }

      const transaction = buildTransaction({
        amount,
        counterparty: {
          displayName: "Ledgera user",
          username: recipient,
        },
        type: "transfer",
      });

      setLedger((currentLedger) => ({
        ...currentLedger,
        availableBalance: currentLedger.availableBalance - amount,
        transactions: [transaction, ...currentLedger.transactions],
      }));

      return { ok: true };
    },
    [buildTransaction, ledger.availableBalance],
  );

  const withdraw = useCallback(
    ({
      accountNumber,
      amount,
      bankName,
    }: WithdrawInput): LedgerActionResult => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, error: "Enter an amount greater than zero." };
      }

      const fee = getTransactionFee("withdrawal");

      if (amount + fee > ledger.availableBalance) {
        return { ok: false, error: "Your available balance is too low." };
      }

      const transaction = buildTransaction({
        amount,
        bankAccount: {
          accountMask: `•••• ${accountNumber.slice(-4)}`,
          bankName,
        },
        type: "withdrawal",
      });

      setLedger((currentLedger) => ({
        ...currentLedger,
        availableBalance:
          currentLedger.availableBalance - amount - transaction.fee,
        transactions: [transaction, ...currentLedger.transactions],
      }));

      return { ok: true };
    },
    [buildTransaction, ledger.availableBalance],
  );

  const value = useMemo(
    () => ({
      ...ledger,
      deposit,
      transfer,
      withdraw,
    }),
    [deposit, ledger, transfer, withdraw],
  );

  return (
    <LedgerContext.Provider value={value}>
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);

  if (!context) {
    throw new Error("useLedger must be used within LedgerProvider.");
  }

  return context;
}
