import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { GoogleSignin } from "@/components/auth/google-signin";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { LabelInput } from "@/components/ui/label-input";
import { Icon } from "@/components/ui/icon";
import { signIn, errorMessage } from "@/lib/api";
import { queryClient } from "@/lib/query";
export default function SigninPage() {
  const navigate = useNavigate(),
    [params] = useSearchParams();
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const next = params.get("next");
  const destination =
    next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
      ? next
      : "/dashboard";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const result = await signIn.email({
        email: String(values.get("email")),
        password: String(values.get("password")),
      });
      if (result.error) throw new Error(result.error.message);
      queryClient.clear();
      navigate(destination, { replace: true });
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthLayout
      eyebrow="YOUR IDEAS MISSED YOU."
      title="Welcome back."
      description="A fresh page. A new possibility. Let’s get into it."
      footer={
        <>
          New around here?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            to="/register"
          >
            Create an account
          </Link>
        </>
      }
    >
      <GoogleSignin
        pending={pending}
        onPendingChange={setPending}
        onError={setError}
        callbackPath={destination}
      />
      <form onSubmit={submit}>
        <FieldGroup>
          <Field>
            <LabelInput
              id="auth-email"
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              defaultValue={params.get("email") || ""}
              required
            />
          </Field>
          <Field>
            <div className="flex justify-end">
              <Link
                className="text-[10px] text-muted-foreground underline underline-offset-4"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            <LabelInput
              id="auth-password"
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              minLength={8}
              maxLength={128}
              required
            />
          </Field>
          <AuthFeedback error={error || params.get("error") || undefined} />
          <Button className="w-full" disabled={pending}>
            {pending ? "One moment…" : "Sign in to your space"}
            <Icon name="arrow" />
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
