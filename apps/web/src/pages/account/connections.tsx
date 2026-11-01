import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

import { useMutation, useQuery } from "@tanstack/react-query";
import { cn } from "cn";

import { ChannelTooltip } from "@/components/channels/channel-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QueryState } from "@/components/workspace/common";
import {
  connectAccount,
  disconnectAccount,
  errorMessage,
  getAccounts,
} from "@/lib/api";
import { connectionCallbackError } from "@/lib/connection-flow";
import { CHANNELS, getChannel } from "@/lib/constants";
import { mutationKeys, queries, queryClient, queryKeys } from "@/lib/query";
import { toast } from "@/lib/toast";
import type { ChannelId, DisconnectAccountInput } from "@/lib/types";

import { CenterPageLayout } from "../center-page-layout";

export default function ConnectionsPage() {
  const accounts = useQuery({
    ...queries.accounts(),
    staleTime: 0,
    refetchOnMount: "always",
  });
  const [params, setParams] = useSearchParams();
  const operation = useRef(false);
  const handledCallback = useRef<string | null>(null);
  const [busy, setBusy] = useState<ChannelId | null>(null);
  const disconnect = useMutation({
    mutationKey: mutationKeys.disconnect,
    mutationFn: ({ id }: DisconnectAccountInput) => disconnectAccount(id),
    onSuccess: async (_, { id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts });
      queryClient.setQueryData<NonNullable<typeof accounts.data>>(
        queryKeys.accounts,
        (current) => current?.filter((account) => account.id !== id)
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success("Account disconnected.");
    },
    onError: async (error) => {
      toast.error(errorMessage(error));
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
    onSettled: () => {
      operation.current = false;
    },
  });

  const refetchAccounts = accounts.refetch;
  useEffect(() => {
    const result = params.get("connection");
    if (result !== "success" && result !== "error") return;
    const callback = params.toString();
    if (handledCallback.current === callback) return;
    handledCallback.current = callback;
    const provider = params.get("provider");
    const channel = provider ? getChannel(provider) : undefined;
    const error = params.get("error");
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const key of [
          "connection",
          "provider",
          "error",
          "error_description",
        ])
          next.delete(key);
        return next;
      },
      { replace: true }
    );
    void refetchAccounts().then((updated) => {
      if (updated.error) {
        toast.error(errorMessage(updated.error));
        return;
      }
      if (result === "error" || error) {
        toast.error(connectionCallbackError(error));
        return;
      }
      if (
        channel &&
        updated.data?.some((account) => account.providerId === channel.id)
      ) {
        toast.success(`${channel.name} connected.`);
      } else toast.error("The connection wasn’t completed. Please try again.");
    });
  }, [params, setParams, refetchAccounts]);

  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      operation.current = false;
      setBusy(null);
      void refetchAccounts();
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, [refetchAccounts]);

  async function connect(provider: ChannelId) {
    if (
      operation.current ||
      accounts.isFetching ||
      accounts.data?.some((account) => account.providerId === provider) ||
      getChannel(provider)?.locked
    )
      return;
    operation.current = true;
    setBusy(provider);
    try {
      const current = await getAccounts();
      queryClient.setQueryData(queryKeys.accounts, current);
      if (current.some((account) => account.providerId === provider)) {
        operation.current = false;
        setBusy(null);
        return;
      }
      const url = await connectAccount(provider);
      window.location.assign(url);
      // Hold the lock through navigation; Back/forward cache restores release it.
    } catch (error) {
      toast.error(errorMessage(error));
      operation.current = false;
      setBusy(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    }
  }

  function disconnectSelected(id: string | undefined) {
    if (operation.current || accounts.isFetching) return;
    if (!id || !accounts.data?.some((account) => account.id === id)) {
      toast.error("This account is already disconnected.");
      void refetchAccounts();
      return;
    }
    operation.current = true;
    disconnect.mutate({ id });
  }
  return (
    <CenterPageLayout
      title="Connected channels"
      description="Manage the social accounts you publish to."
    >
      <QueryState
        loadingLabel="Loading your channels"
        pending={accounts.isPending}
        error={!accounts.data ? accounts.error : null}
        retry={() => accounts.refetch()}
      />
      {accounts.data && (
        <div
          className="flex flex-wrap gap-6"
          role="group"
          aria-label="Publishing channels"
        >
          {CHANNELS.map((channel) => {
            const account = accounts.data.find(
              (account) => account.providerId === channel.id
            );
            const connected = !!account;
            const label = channel.locked
              ? `${channel.name} — locked, coming soon`
              : busy === channel.id
                ? `Connecting ${channel.name}…`
                : connected
                  ? `${channel.name} — connected; manage connection`
                  : `Connect ${channel.name}`;
            return (
              <ChannelTooltip key={channel.id} label={label}>
                <DropdownMenu
                  onOpenChange={(open, details) => {
                    if (
                      open &&
                      (!connected || operation.current || channel.locked)
                    )
                      details.cancel();
                  }}
                >
                  <DropdownMenuTrigger
                    render={
                      <button
                        onClick={() => {
                          if (!connected) void connect(channel.id);
                        }}
                        type="button"
                        className={cn(
                          "rounded-xl disabled:opacity-100 bg-primary-foreground p-1 ring ring-muted cursor-pointer disabled:cursor-not-allowed relative",
                          channel.locked && "grayscale-100",
                          connected && "bg-emerald-400 ring-emerald-500"
                        )}
                        aria-label={label}
                        disabled={
                          !!busy ||
                          disconnect.isPending ||
                          accounts.isFetching ||
                          channel.locked
                        }
                      />
                    }
                  >
                    {connected && (
                      <div className="absolute size-4 rounded-full bg-emerald-400 -top-1 -right-1 ring ring-emerald-500" />
                    )}
                    <div className="bg-white p-6 rounded-[calc(0.625rem)] ring ring-muted">
                      <img
                        src={channel.icon}
                        className={cn(
                          channel.iconClassName,
                          "size-10 shrink-0"
                        )}
                      />
                    </div>
                    <p
                      className={cn(
                        "subheading text-sm! mt-2 mb-1",
                        connected && "text-white!"
                      )}
                    >
                      {channel.name}
                    </p>
                  </DropdownMenuTrigger>
                  {account && (
                    <DropdownMenuContent align="start">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{channel.name}</DropdownMenuLabel>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={
                            disconnect.isPending ||
                            !!busy ||
                            accounts.isFetching
                          }
                          onClick={() => disconnectSelected(account.id)}
                        >
                          Disconnect {channel.name}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </ChannelTooltip>
            );
          })}
        </div>
      )}
    </CenterPageLayout>
  );
}
