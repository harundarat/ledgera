"use client";

import {
  Alert,
  Button,
  Card,
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

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const requestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (requestTimer.current) {
        clearTimeout(requestTimer.current);
      }
    };
  }, []);

  function clearAuthError() {
    if (hasAuthError) {
      setHasAuthError(false);
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setHasAuthError(false);
    setIsLoading(true);

    requestTimer.current = setTimeout(() => {
      setIsLoading(false);
      setHasAuthError(true);
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
            Welcome back
          </Card.Title>
          <Card.Description className="text-sm leading-6 text-muted">
            Enter your credentials to access your account.
          </Card.Description>
        </Card.Header>

        <Form
          aria-label="Sign in"
          aria-busy={isLoading}
          className="contents"
          validationBehavior="native"
          onSubmit={handleSubmit}
        >
          <Card.Content className="flex flex-col gap-5 px-6 pt-5 sm:px-8">
            {hasAuthError ? (
              <Alert
                role="alert"
                status="danger"
                className="items-center"
              >
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Invalid email or password.</Alert.Title>
                </Alert.Content>
              </Alert>
            ) : null}

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              name="email"
              type="email"
              onChange={clearAuthError}
            >
              <Label>Email</Label>
              <Input
                autoComplete="email"
                placeholder="you@example.com"
              />
              <FieldError />
            </TextField>

            <TextField
              fullWidth
              isRequired
              isDisabled={isLoading}
              name="password"
              type="password"
              onChange={clearAuthError}
            >
              <Label>Password</Label>
              <Input
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <FieldError />
            </TextField>

            <div className="flex justify-end">
              <Link
                className="text-sm font-medium hover:text-accent"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
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
                  {isPending ? "Signing in..." : "Sign in"}
                </>
              )}
            </Button>
          </Card.Footer>
        </Form>
      </Card>

      <div className="space-y-2 text-center">
        <p className="text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-accent" href="/register">
            Create account
          </Link>
        </p>
        <p className="text-xs text-muted">
          Secure access to your Ledgera workspace.
        </p>
      </div>
    </div>
  );
}
