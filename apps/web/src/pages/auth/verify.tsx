import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { LabelInput } from "@/components/ui/label-input";
import { Icon } from "@/components/ui/icon";
import { sendVerificationEmail, verifyEmail, errorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
export default function VerifyPage() {
  const [params] = useSearchParams(),
    { data: session } = authClient.useSession();
  const token = params.get("token");
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
      const result = token
        ? await verifyEmail({ query: { token } })
        : await sendVerificationEmail({
            email: String(values.get("email")),
            callbackURL: `${location.origin}/dashboard`,
          });
      if (result.error) throw new Error(result.error.message);
      setSuccess(
        token
          ? "Your email is verified. You’re ready to sign in."
          : "If verification is available for this account, you’ll receive an email shortly.",
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthLayout
      eyebrow="JUST ONE LITTLE CHECK."
      title="Check your inbox."
      description="Verify your email to make this space officially yours."
      footer={
        <Link className="underline underline-offset-4" to="/signin">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={submit}>
        <FieldGroup>
          {!token && (
            <Field>
              <LabelInput
                id="auth-email"
                label="Email address"
                type="email"
                name="email"
                autoComplete="email"
                defaultValue={params.get("email") || session?.user.email || ""}
                required
              />
            </Field>
          )}
          <AuthFeedback
            error={
              error ||
              (params.get("error")
                ? "This link is invalid or expired. Please request a new one."
                : undefined)
            }
            success={success}
          />
          <Button className="w-full" disabled={pending}>
            {pending
              ? "One moment…"
              : token
                ? "Verify my email"
                : "Send verification email"}
            <Icon name="arrow" />
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
