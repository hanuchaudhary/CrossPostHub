import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";

import { AuthFeedback } from "@/components/auth/auth-feedback";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleSignin } from "@/components/auth/google-signin";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { LabelInput } from "@/components/ui/label-input";
import { errorMessage, signUp } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = new FormData(event.currentTarget),
      email = String(values.get("email"));
    try {
      const result = await signUp.email({
        email,
        name: email.split("@")[0],
        password: String(values.get("password")),
        callbackURL: `${location.origin}/dashboard`,
      });
      if (result.error) throw new Error(result.error.message);
      queryClient.clear();
      const session = await authClient.getSession();
      navigate(
        session.data
          ? "/dashboard"
          : `/verify?email=${encodeURIComponent(email)}`,
        { replace: true }
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthLayout
      title="Make yourself at home."
      description="Your next chapter starts right here."
      footer={
        <>
          Already have a space?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            to="/signin"
          >
            Sign in
          </Link>
        </>
      }
    >
      <GoogleSignin
        pending={pending}
        onPendingChange={setPending}
        onError={setError}
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
              required
            />
          </Field>
          <Field>
            <LabelInput
              id="auth-password"
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </Field>
          <AuthFeedback error={error} />
          <Button className="w-full" disabled={pending}>
            {pending ? "One moment…" : "Create your free account"}
            <Icon name="arrow" />
          </Button>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
