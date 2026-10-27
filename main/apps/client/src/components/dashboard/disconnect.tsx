import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth.client";
import { useDashboardStore } from "@/store/dashboard/use-dashboard-store";
import type { SocialApp } from "@/components/dashboard/connect-accounts";

export function Disconnect({ app }: { app: SocialApp }) {
  const [loading, setLoading] = useState(false);
  const { connectedApps, fetchConnectedApps } = useDashboardStore();
  const disconnect = async () => {
    const account = connectedApps.find((item) => item.providerId === app.provider);
    if (!account) return;
    setLoading(true);
    const { error } = await authClient.unlinkAccount({ accountId: account.id });
    if (error) toast.error("Unable to disconnect", { description: error.message });
    else { toast.success(`${app.name} disconnected`); await fetchConnectedApps(); }
    setLoading(false);
  };
  return <button className="rounded-full bg-destructive px-3 py-1 text-sm text-destructive-foreground" onClick={disconnect} disabled={loading}>{loading ? "Disconnecting…" : "Disconnect"}</button>;
}
