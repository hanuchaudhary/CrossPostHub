import type { PasswordChangeInput } from "@/lib/types";
import { useRef, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { changePassword, errorMessage } from "@/lib/api";
import { mutationKeys } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { LabelInput } from "@/components/ui/label-input";
export function ChangePassword() {
  const form = useRef<HTMLFormElement>(null);
  const mutation = useMutation({
    mutationKey: mutationKeys.password,
    mutationFn: async (values: PasswordChangeInput) => {
      const result = await changePassword({
        ...values,
        revokeOtherSessions: true,
      });
      if (result.error)
        throw new Error(result.error.message || "Could not update password");
    },
    onSuccess: () => {
      form.current?.reset();
      toast.success("Password updated");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    mutation.mutate({
      currentPassword: String(values.get("currentPassword")),
      newPassword: String(values.get("newPassword")),
    });
  }
  return (
    <section aria-labelledby="password-heading" className="py-8">
      <h2 id="password-heading" className="font-medium">
        Change password
      </h2>
      <form ref={form} onSubmit={submit} className="">
        <fieldset disabled={mutation.isPending}>
          <div className="">
            <LabelInput
              id="current-password"
              name="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              required
            />
            <LabelInput
              id="new-password"
              name="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />
          </div>
          <div className="mt-7 flex justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-auto rounded-full bg-linear-to-b from-neutral-600 to-neutral-800 px-4 py-1.75 text-sm text-white shadow-[0_2px_8px_rgba(23,23,23,0.25),inset_0_1.5px_0_rgba(255,255,255,0.25)] dark:from-white dark:to-neutral-200 dark:text-neutral-800"
            >
              {mutation.isPending ? "Updating…" : "Update password"}
            </Button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
