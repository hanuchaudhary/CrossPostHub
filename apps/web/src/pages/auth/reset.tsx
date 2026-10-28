import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { LabelInput } from "@/components/ui/label-input";
import { Icon } from "@/components/ui/icon";
import { resetPassword, errorMessage } from "@/lib/api";
export default function ResetPage() {
  const [params] = useSearchParams(),
    token = params.get("token");
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
      if (!token)
        throw new Error(
          "This reset link is missing or expired. Please request a new one.",
        );
      if (values.get("password") !== values.get("confirm"))
        throw new Error("Your passwords do not match.");
      const result = await resetPassword({
        token,
        newPassword: String(values.get("password")),
      });
      if (result.error) throw new Error(result.error.message);
      setSuccess("Your password has been reset. You can now sign in.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthLayout
      eyebrow="A FRESH START."
      title="New password. New energy."
      description="Choose a strong password to get back to creating."
      footer={
        <Link
          className="underline underline-offset-4"
          to={token ? "/signin" : "/forgot-password"}
        >
          {token ? "Back to sign in" : "Request a new reset link"}
        </Link>
      }
    >
      <form onSubmit={submit}>
        <FieldGroup>
          <Field>
            <LabelInput
              id="auth-password"
              label="New password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </Field>
          <Field>
            <LabelInput
              id="auth-confirm"
              label="Confirm password"
              type="password"
              name="confirm"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </Field>
          <AuthFeedback
            error={
              error ||
              (params.get("error")
                ? "This link is invalid or expired. Please request a new one."
                : undefined)
            }
            success={success}
          />
          <Button className="w-full" disabled={pending || !token || !!success}>
            {pending ? "One moment…" : "Reset password"}
            <Icon name="arrow" />
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
