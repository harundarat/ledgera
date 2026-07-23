"use client";

import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Modal,
  Spinner,
  TextField,
  toast,
} from "@heroui/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import { useLedger } from "@/components/ledger-provider";
import {
  formatCurrency,
  transactionLabels,
  type TransactionType,
} from "@/lib/ledger";

const MOCK_REQUEST_DELAY_MS = 800;

const dialogCopy: Record<
  TransactionType,
  {
    description: string;
    submitLabel: string;
  }
> = {
  deposit: {
    description: "Add funds to your available balance.",
    submitLabel: "Deposit funds",
  },
  transfer: {
    description: "Send funds to another Ledgera user.",
    submitLabel: "Send transfer",
  },
  withdrawal: {
    description: "Move funds to your bank account.",
    submitLabel: "Withdraw funds",
  },
};

const dialogIcons: Record<TransactionType, LucideIcon> = {
  deposit: ArrowDownLeft,
  transfer: ArrowUpRight,
  withdrawal: Landmark,
};

interface TransactionDialogProps {
  isOpen: boolean;
  type: TransactionType;
  onOpenChange: (isOpen: boolean) => void;
}

export function TransactionDialog({
  isOpen,
  onOpenChange,
  type,
}: Readonly<TransactionDialogProps>) {
  const {
    availableBalance,
    deposit,
    transfer,
    user,
    withdraw,
  } = useLedger();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const requestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = dialogIcons[type];
  const copy = dialogCopy[type];

  useEffect(() => {
    return () => {
      if (requestTimer.current) {
        clearTimeout(requestTimer.current);
      }
    };
  }, []);

  function resetForm() {
    setAmount("");
    setRecipient("");
    setBankName("");
    setAccountNumber("");
    setValidationErrors({});
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (isPending && !nextIsOpen) {
      return;
    }

    if (!nextIsOpen) {
      resetForm();
    }

    onOpenChange(nextIsOpen);
  }

  function clearFieldError(field: string) {
    setValidationErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const parsedAmount = Number(amount);
    const nextErrors: Record<string, string> = {};

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }

    if (
      type !== "deposit" &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > availableBalance
    ) {
      nextErrors.amount = "Your available balance is too low.";
    }

    if (type === "transfer") {
      const normalizedRecipient = recipient.trim().replace(/^@/, "");

      if (normalizedRecipient.length < 3) {
        nextErrors.recipient = "Enter a valid recipient username.";
      } else if (
        normalizedRecipient.toLowerCase() === user.username.toLowerCase()
      ) {
        nextErrors.recipient = "You cannot transfer to your own account.";
      }
    }

    if (type === "withdrawal") {
      if (bankName.trim().length < 2) {
        nextErrors.bankName = "Enter a valid bank name.";
      }

      if (!/^\d{6,20}$/.test(accountNumber.trim())) {
        nextErrors.accountNumber =
          "Account number must contain 6–20 digits.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});
    setIsPending(true);

    requestTimer.current = setTimeout(() => {
      const normalizedRecipient = recipient.trim().replace(/^@/, "");
      const result =
        type === "deposit"
          ? deposit({ amount: parsedAmount })
          : type === "transfer"
            ? transfer({
                amount: parsedAmount,
                recipient: normalizedRecipient,
              })
            : withdraw({
                accountNumber: accountNumber.trim(),
                amount: parsedAmount,
                bankName: bankName.trim(),
              });

      setIsPending(false);
      requestTimer.current = null;

      if (!result.ok) {
        setValidationErrors({ amount: result.error });
        return;
      }

      resetForm();
      onOpenChange(false);
      toast.success(`${transactionLabels[type]} completed`, {
        description: `${formatCurrency(parsedAmount)} was processed in this demo.`,
      });
    }, MOCK_REQUEST_DELAY_MS);
  }

  return (
    <Modal.Backdrop
      isDismissable={!isPending}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
    >
      <Modal.Container placement="auto">
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
              <Icon aria-hidden="true" />
            </Modal.Icon>
            <Modal.Heading>{transactionLabels[type]}</Modal.Heading>
            <p className="text-sm text-muted">{copy.description}</p>
          </Modal.Header>

          <Form
            aria-label={`${transactionLabels[type]} simulation`}
            aria-busy={isPending}
            className="contents"
            validationBehavior="native"
            validationErrors={validationErrors}
            onSubmit={handleSubmit}
          >
            <Modal.Body className="flex flex-col gap-5">
              {type === "transfer" ? (
                <TextField
                  fullWidth
                  isRequired
                  isDisabled={isPending}
                  name="recipient"
                  value={recipient}
                  onChange={(value) => {
                    setRecipient(value);
                    clearFieldError("recipient");
                  }}
                >
                  <Label>Recipient username</Label>
                  <Input
                    autoCapitalize="none"
                    placeholder="@username"
                    spellCheck={false}
                  />
                  <FieldError />
                </TextField>
              ) : null}

              {type === "withdrawal" ? (
                <>
                  <TextField
                    fullWidth
                    isRequired
                    isDisabled={isPending}
                    name="bankName"
                    value={bankName}
                    onChange={(value) => {
                      setBankName(value);
                      clearFieldError("bankName");
                    }}
                  >
                    <Label>Bank name</Label>
                    <Input placeholder="Bank Central Asia" />
                    <FieldError />
                  </TextField>

                  <TextField
                    fullWidth
                    isRequired
                    isDisabled={isPending}
                    name="accountNumber"
                    value={accountNumber}
                    onChange={(value) => {
                      setAccountNumber(value);
                      clearFieldError("accountNumber");
                    }}
                  >
                    <Label>Account number</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="0123456789"
                    />
                    <FieldError />
                  </TextField>
                </>
              ) : null}

              <TextField
                fullWidth
                isRequired
                isDisabled={isPending}
                name="amount"
                type="number"
                value={amount}
                onChange={(value) => {
                  setAmount(value);
                  clearFieldError("amount");
                }}
              >
                <Label>Amount (IDR)</Label>
                <Input
                  inputMode="numeric"
                  min={1}
                  placeholder="500000"
                  step={1}
                />
                <FieldError />
              </TextField>

              {type !== "deposit" ? (
                <p className="text-xs text-muted">
                  Available: {formatCurrency(availableBalance)}
                </p>
              ) : null}
            </Modal.Body>

            <Modal.Footer>
              <Button
                isDisabled={isPending}
                type="button"
                variant="secondary"
                onPress={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button isPending={isPending} type="submit">
                {({ isPending: buttonIsPending }) => (
                  <>
                    {buttonIsPending ? (
                      <Spinner color="current" size="sm" />
                    ) : null}
                    {buttonIsPending ? "Processing..." : copy.submitLabel}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
