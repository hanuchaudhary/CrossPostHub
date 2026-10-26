import type { ReactNode } from "react";
import { dodopaymentsClient } from "@dodopayments/better-auth/client";
import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
export const authClient = createAuthClient({ baseURL: apiUrl, fetchOptions: { credentials: "include" }, plugins: [dodopaymentsClient()] });

export function SessionProvider({ children }: { children: ReactNode }) { return children; }

export function useSession() {
  const session = authClient.useSession();
  return { ...session, status: session.isPending ? "loading" : session.data ? "authenticated" : "unauthenticated" } as const;
}

export async function signIn(provider: string, options: Record<string, unknown> = {}) {
  if (provider === "credentials") {
    const result = await authClient.signIn.email({ email: String(options.email ?? ""), password: String(options.password ?? ""), callbackURL: String(options.callbackUrl ?? "/dashboard") });
    return { ok: !result.error, error: result.error?.message, url: String(options.callbackUrl ?? "/dashboard") };
  }
  const callbackURL = String(options.callbackUrl ?? `${window.location.origin}/dashboard`);
  const result = provider === "google" ? await authClient.signIn.social({ provider, callbackURL }) : await authClient.linkSocial({ provider, callbackURL });
  return { ok: !result.error, error: result.error?.message, url: result.data?.url };
}

export async function signOut() { return authClient.signOut(); }
