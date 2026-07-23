"use client";

import {
  Alert,
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Spinner,
  TextField,
} from "@heroui/react";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";

const MOCK_REQUEST_DELAY_MS = 900;
const RESERVED_USERNAMES = new Set(["admin", "ledgera"]);
const RESERVED_EMAILS = new Set([
  "admin@ledgera.com",
  "demo@ledgera.com",
]);

type AvailabilityField = "username" | "email";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState<
    Record<string, string>
  >({});
  const requestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (requestTimer.current) {
        clearTimeout(requestTimer.current);
      }
    };
  }, []);

  function clearFeedback(field?: AvailabilityField) {
    setIsSuccess(false);

    if (!field) {
      return;
    }

    setAvailabilityErrors((currentErrors) => {
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

    if (isLoading) {
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    setAvailabilityErrors({});
    setIsSuccess(false);
    setIsLoading(true);

    requestTimer.current = setTimeout(() => {
      const nextErrors: Record<string, string> = {};

      if (RESERVED_USERNAMES.has(normalizedUsername)) {
        nextErrors.username = "This username is already in use.";
      }

      if (RESERVED_EMAILS.has(normalizedEmail)) {
        nextErrors.email = "An account already exists with this email.";
      }

      setAvailabilityErrors(nextErrors);
      setIsSuccess(Object.keys(nextErrors).length === 0);
      setIsLoading(false);
      requestTimer.current = null;
    }, MOCK_REQUEST_DELAY_MS);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-3" aria-label="Ledgera">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground"
        >
          L
        </span>
        <span className="text-xl font-semibold tracking-tight">
          Ledgera
        </span>
      </div>

      <Card className="w-full gap-0 bg-surface p-0">
        <Card.Header className="gap-2 px-6 pt-7 pb-2 text-center sm:px-8 sm:pt-8">
          <Card.Title className="text-xl font-semibold tracking-tight">
            Create your account
          </Card.Title>
          <Card.Description className="text-sm leading-6 text-muted">
            Set up your details to start using Ledgera.
          </Card.Description>
        </Card.Header>

        <Form
          aria-label="Create account"
          aria-busy={isLoading}
          className="contents"
          validationBehavior="native"
          validationErrors={availabilityErrors}
          onSubmit={handleSubmit}
        >
          <Card.Content className="flex flex-col gap-5 px-6 pt-5 sm:px-8">
            {isSuccess ? (
              <Alert role="status" status="success" className="items-center">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Account created successfully.</Alert.Title>
                  <Alert.Description>
                    This is a UI preview. No account data has been saved.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              name="fullName"
              value={fullName}
              validate={(value) =>
                value.trim().length >= 2
                  ? null
                  : "Full name must be at least 2 characters."
              }
              onChange={(value) => {
                setFullName(value);
                clearFeedback();
              }}
            >
              <Label>Full name</Label>
              <Input
                autoComplete="name"
                placeholder="John Doe"
              />
              <FieldError />
            </TextField>

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              maxLength={20}
              minLength={3}
              name="username"
              value={username}
              validate={(value) => {
                const normalizedValue = value.trim();

                if (
                  normalizedValue.length < 3 ||
                  normalizedValue.length > 20
                ) {
                  return "Username must be between 3 and 20 characters.";
                }

                if (!/^[a-zA-Z0-9_]+$/.test(normalizedValue)) {
                  return "Use only letters, numbers, and underscores.";
                }

                return null;
              }}
              onChange={(value) => {
                setUsername(value);
                clearFeedback("username");
              }}
            >
              <Label>Username</Label>
              <Input
                autoCapitalize="none"
                autoComplete="username"
                placeholder="john_doe"
                spellCheck={false}
              />
              <Description>
                3–20 letters, numbers, or underscores.
              </Description>
              <FieldError />
            </TextField>

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              name="email"
              type="email"
              value={email}
              validate={(value) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? null
                  : "Enter a valid email address."
              }
              onChange={(value) => {
                setEmail(value);
                clearFeedback("email");
              }}
            >
              <Label>Email</Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                placeholder="you@example.com"
                spellCheck={false}
              />
              <FieldError />
            </TextField>

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              minLength={8}
              name="password"
              type="password"
              value={password}
              validate={(value) => {
                if (value.length < 8) {
                  return "Password must be at least 8 characters.";
                }

                if (
                  !/[a-z]/.test(value) ||
                  !/[A-Z]/.test(value) ||
                  !/[0-9]/.test(value)
                ) {
                  return "Include uppercase, lowercase, and a number.";
                }

                return null;
              }}
              onChange={(value) => {
                setPassword(value);
                clearFeedback();
              }}
            >
              <Label>Password</Label>
              <Input
                autoComplete="new-password"
                placeholder="Create a password"
              />
              <Description>
                At least 8 characters with uppercase, lowercase, and a number.
              </Description>
              <FieldError />
            </TextField>

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              validate={(value) =>
                value === password ? null : "Passwords do not match."
              }
              onChange={(value) => {
                setConfirmPassword(value);
                clearFeedback();
              }}
            >
              <Label>Confirm password</Label>
              <Input
                autoComplete="new-password"
                placeholder="Repeat your password"
              />
              <FieldError />
            </TextField>
          </Card.Content>

          <Card.Footer className="px-6 pt-6 pb-6 sm:px-8 sm:pb-8">
            <Button
              fullWidth
              isPending={isLoading}
              size="lg"
              type="submit"
            >
              {({ isPending }) => (
                <>
                  {isPending ? (
                    <Spinner color="current" size="sm" />
                  ) : null}
                  {isPending ? "Creating account..." : "Create account"}
                </>
              )}
            </Button>
          </Card.Footer>
        </Form>
      </Card>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-accent" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
