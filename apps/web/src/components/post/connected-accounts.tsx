import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { IconChevronDown, IconCrownFilled } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

import { useConfirm } from "@/components/confirm-dialog";
import { ConnectDialog } from "@/components/post/connect-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  apiError,
  PostApi,
  type SocialConnection,
  type SocialProvider,
} from "@/lib/api/post";
import { queryKeys } from "@/lib/query";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type ConnectKind,
  iconInvert,
  PROVIDERS,
  useConnections,
  usePostingAccess,
} from "./use-social";

function UpgradeButton({
  label = "Upgrade to connect",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Button
      variant="secondary"
      nativeButton={false}
      render={<Link to="/pricing" />}
      className={className}
    >
      <IconCrownFilled className="text-amber-400" />
      {label}
    </Button>
  );
}

function useCallbackToast() {
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const connected = params.get("connected");
    const error = params.get("error");
    if (!connected && !error) return;
    if (connected) {
      const label =
        PROVIDERS.find((provider) => provider.id === connected)?.label ??
        connected;
      toast.success(`${label} connected`);
    } else {
      toast.error(error ?? "Connection failed");
    }
    setParams({}, { replace: true });
  }, [params, setParams]);
}

const spring = { type: "spring", bounce: 0.15, duration: 0.5 } as const;

function AccountAvatar({
  connection,
  className,
}: {
  connection: SocialConnection;
  className?: string;
}) {
  return (
    <motion.div
      layoutId={`account-avatar-${connection.id}`}
      transition={spring}
      className={cn("shrink-0 rounded-full", className)}
    >
      <Avatar className="size-full">
        <AvatarImage src={connection.avatarUrl ?? undefined} alt="" />
        <AvatarFallback>{connection.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
    </motion.div>
  );
}

function AccountRow({
  connection,
  onDisconnect,
  onReconnect,
  busy,
  locked,
}: {
  connection: SocialConnection;
  onDisconnect: () => void;
  onReconnect: () => void;
  busy: boolean;
  locked: boolean;
}) {
  const reauth = connection.status === "NEEDS_REAUTH";
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <AccountAvatar connection={connection} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate txt text-sm font-medium">{connection.name}</p>
        <p
          className={cn(
            "text-xs txt",
            reauth ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {reauth ? "Access expired. Reconnect to keep posting." : "Connected"}
        </p>
      </div>
      {reauth &&
        (locked ? (
          <UpgradeButton label="Upgrade to reconnect" />
        ) : (
          <Button size="sm" onClick={onReconnect} disabled={busy}>
            Reconnect
          </Button>
        ))}
      <Button size="sm" variant="ghost" onClick={onDisconnect} disabled={busy}>
        Disconnect
      </Button>
    </div>
  );
}

function ProviderCard({
  provider,
  accounts,
  allowed,
  configured,
  several,
  busy,
  onConnect,
  onDisconnect,
}: {
  provider: (typeof PROVIDERS)[number];
  accounts: SocialConnection[];
  allowed: boolean;
  configured: boolean;
  several: boolean;
  busy: string | null;
  onConnect: (provider: SocialProvider) => void;
  onDisconnect: (connection: SocialConnection) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasAccounts = accounts.length > 0;
  const expanded = open && hasAccounts;

  return (
    <motion.section
      layout
      transition={spring}
      className="rounded-2xl bg-popover/30 p-1 ring-1 ring-foreground/10"
    >
      <motion.div
        layout="position"
        transition={spring}
        className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-xl bg-secondary p-3 shadow ring-2 ring-muted"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-background">
          <img
            src={provider.icon}
            alt=""
            className={cn("size-7", iconInvert(provider))}
          />
        </span>
        <div className="min-w-0 flex-1 basis-32">
          <h2 className="truncate txt font-medium">{provider.label}</h2>
          <p className="mt-0.5 text-sm txt text-muted-foreground">
            {hasAccounts
              ? `${accounts.length} connected`
              : configured
                ? "Not connected"
                : "Not set up on this server yet"}
          </p>
        </div>
        {hasAccounts && !open && (
          <div className="flex -space-x-2">
            {accounts.map((connection) => (
              <AccountAvatar
                key={connection.id}
                connection={connection}
                className="size-7 ring-2 ring-secondary"
              />
            ))}
          </div>
        )}
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          {configured && !allowed && (
            <UpgradeButton className="flex-1 sm:flex-none" />
          )}
          {configured && allowed && hasAccounts && !several && (
            <UpgradeButton
              label="Upgrade to add another"
              className="flex-1 sm:flex-none"
            />
          )}
          {configured && allowed && (!hasAccounts || several) && (
            <Button
              variant={hasAccounts ? "secondary" : "primary"}
              className="flex-1 sm:flex-none"
              onClick={() => onConnect(provider.id)}
              disabled={busy === provider.id}
            >
              {busy === provider.id
                ? "Opening…"
                : hasAccounts
                  ? "Add another"
                  : "Connect"}
            </Button>
          )}
          {hasAccounts && (
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              aria-label={open ? "Collapse accounts" : "Show accounts"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <IconChevronDown
                className={cn(
                  "transition-transform duration-300",
                  open && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      </motion.div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="accounts"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
            className="overflow-hidden"
          >
            <div className="divide-y pt-1">
              {accounts.map((connection) => (
                <AccountRow
                  key={connection.id}
                  connection={connection}
                  busy={busy === connection.id}
                  locked={!allowed}
                  onDisconnect={() => onDisconnect(connection)}
                  onReconnect={() => onConnect(connection.provider)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export function ConnectedAccounts() {
  useCallbackToast();
  const { data: connections, isLoading } = useConnections();
  const access = usePostingAccess();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState<Exclude<ConnectKind, "oauth"> | null>(null);

  const connect = async (provider: SocialProvider) => {
    const kind = PROVIDERS.find((item) => item.id === provider)?.connect;
    if (kind && kind !== "oauth") {
      setForm(kind);
      return;
    }
    setBusy(provider);
    try {
      await PostApi.connect(provider);
    } catch (error) {
      toast.error(apiError(error, "Could not start connecting"));
      setBusy(null);
    }
  };

  const disconnect = (connection: SocialConnection) =>
    confirm({
      title: `Disconnect ${connection.name}?`,
      description:
        "Its scheduled posts are cancelled. Posts already published stay on the platform, and you can connect it again any time.",
      confirmLabel: "Disconnect",
      destructive: true,
      onConfirm: async () => {
        try {
          await PostApi.disconnect(connection.id);
        } catch (error) {
          toast.error(apiError(error, "Could not disconnect"));
          throw error;
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["post"] }),
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        ]);
        toast.success(`${connection.name} disconnected`);
      },
    });

  if (isLoading || access.loading) {
    return <Skeleton className="h-48 w-full rounded-3xl" />;
  }

  return (
    <LayoutGroup>
      <div className="space-y-2">
        {PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            accounts={
              connections?.filter((item) => item.provider === provider.id) ?? []
            }
            allowed={access.allowed}
            configured={access.configured.has(provider.id)}
            several={access.several}
            busy={busy}
            onConnect={(id) => void connect(id)}
            onDisconnect={(connection) => void disconnect(connection)}
          />
        ))}
      </div>
      <ConnectDialog
        kind={form}
        onOpenChange={(open) => !open && setForm(null)}
        onConnected={() => {
          void queryClient.invalidateQueries({ queryKey: ["post"] });
          void queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
        }}
      />
    </LayoutGroup>
  );
}
