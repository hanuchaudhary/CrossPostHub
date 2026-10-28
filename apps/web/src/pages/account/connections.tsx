import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { ChannelIcon } from "@/components/channels/channel-icon";
import { ChannelTooltip } from "@/components/channels/channel-tooltip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeading, QueryState } from "@/components/workspace/common";
import { connectAccount, disconnectAccount, errorMessage } from "@/lib/api";
import { CHANNELS } from "@/lib/constants";
import { mutationKeys, queries, queryClient, queryKeys } from "@/lib/query";
import type { ChannelId, DisconnectAccountInput } from "@/lib/types";

import { CenterPageLayout } from "../center-page-layout";

export default function ConnectionsPage() {
  const accounts = useQuery(queries.accounts());
  const [busy, setBusy] = useState<ChannelId | null>(null);
  const disconnect = useMutation({
    mutationKey: mutationKeys.disconnect,
    mutationFn: ({ id }: DisconnectAccountInput) => disconnectAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
      toast.success("Account disconnected.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  async function connect(provider: ChannelId) {
    setBusy(provider);
    try {
      await connectAccount(provider);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  }
  return (
    <CenterPageLayout
      title="Connected channels"
      description="Manage the social accounts you publish to."
    >
      <QueryState
        pending={accounts.isPending}
        error={accounts.error}
        retry={() => accounts.refetch()}
      />
      {accounts.isSuccess && (
        <div
          className="flex flex-wrap gap-8"
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
            const icon = (
              <ChannelIcon
                channel={channel}
                connected={connected}
                className="size-10"
              />
            );
            return (
              <ChannelTooltip key={channel.id} label={label}>
                {connected && !channel.locked ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="size-18 rounded-xl disabled:opacity-100 bg-primary flex items-center justify-center"
                          aria-label={label}
                          disabled={!!busy || disconnect.isPending}
                        />
                      }
                    >
                      {icon}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{channel.name}</DropdownMenuLabel>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={disconnect.isPending}
                          onClick={() => disconnect.mutate({ id: account.id })}
                        >
                          Disconnect {channel.name}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="size-18 rounded-xl disabled:opacity-100 bg-primary/10"
                    aria-label={label}
                    disabled={channel.locked || !!busy || disconnect.isPending}
                    aria-busy={busy === channel.id || undefined}
                    onClick={() => connect(channel.id)}
                  >
                    {icon}
                  </Button>
                )}
              </ChannelTooltip>
            );
          })}
        </div>
      )}
    </CenterPageLayout>
  );
}
