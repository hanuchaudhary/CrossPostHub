import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { LabelInput } from "@/components/ui/label-input";
import { Icon } from "@/components/ui/icon";
import { requestPasswordReset, errorMessage } from "@/lib/api";
export default function ForgotPage() {
  const [params] = useSearchParams();
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccess("");
    const values = new FormData(event.currentTarget);
    try {
      const result = await requestPasswordReset({
        email: String(values.get("email")),
        redirectTo: `${location.origin}/reset-password`,
      });
      if (result.error) throw new Error(result.error.message);
      setSuccess(
        "If an account exists for this email, a reset link is on its way. Check your inbox and spam folder.",
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthLayout
      eyebrow="IT HAPPENS TO THE BEST OF US."
      title="Lost your password?"
      description="Enter your email and we’ll send you a reset link."
      footer={
        <Link className="underline underline-offset-4" to="/signin">
          Back to sign in
        </Link>
      }
    >
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
          <AuthFeedback error={error} success={success} />
          <Button className="w-full" disabled={pending}>
            {pending ? "One moment…" : "Send reset link"}
            <Icon name="arrow" />
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
