import { useState } from "react";

import { IconCopy } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiError, PostApi } from "@/lib/api/post";
import { toast } from "@/lib/toast";

import type { ConnectKind } from "./use-social";

type FormKind = Exclude<ConnectKind, "oauth">;

const COPY: Record<FormKind, { title: string; description: string }> = {
  bluesky: {
    title: "Connect Bluesky",
    description:
      "Use an app password, not your main password. Create one in Bluesky under Settings → Privacy and security → App passwords.",
  },
  mastodon: {
    title: "Connect Mastodon",
    description:
      "Enter the server your account is on. You'll sign in there and come back here.",
  },
  telegram: {
    title: "Connect a Telegram channel",
    description:
      "Add the CrossPostHub bot to your channel as an admin that can post messages, then enter the channel below.",
  },
};

function Text({
  id,
  label,
  ...props
}: React.ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="pl-1">
        {label}
      </Label>
      <Input id={id} className="h-10" {...props} />
    </div>
  );
}

export function ConnectDialog({
  kind,
  onOpenChange,
  onConnected,
}: {
  kind: FormKind | null;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [telegram, setTelegram] = useState<{
    state: string;
    code: string;
    chat: string;
  } | null>(null);
  const set = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const close = (open: boolean) => {
    if (busy) return;
    if (!open) {
      setValues({});
      setTelegram(null);
    }
    onOpenChange(open);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      toast.error(apiError(error, "Could not connect"));
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      if (kind === "mastodon") {
        await PostApi.connect("mastodon", { instance: values.instance ?? "" });
        return;
      }
      if (kind === "bluesky") {
        const connection = await PostApi.connectForm("bluesky", {
          identifier: values.identifier ?? "",
          password: values.password ?? "",
        });
        toast.success(`${connection.name} connected`);
        setValues({});
        onConnected();
        onOpenChange(false);
        return;
      }
      if (kind === "telegram") {
        if (!telegram) {
          setTelegram(await PostApi.telegramStart(values.chat ?? ""));
          return;
        }
        const connection = await PostApi.telegramVerify(telegram.state);
        toast.success(`${connection.name} connected`);
        setTelegram(null);
        setValues({});
        onConnected();
        onOpenChange(false);
      }
    });

  const copy = kind ? COPY[kind] : null;
  const ready =
    kind === "mastodon"
      ? !!values.instance?.trim()
      : kind === "bluesky"
        ? !!values.identifier?.trim() && !!values.password?.trim()
        : !!telegram || !!values.chat?.trim();

  return (
    <Dialog open={!!kind} onOpenChange={close}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        {copy && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (ready && !busy) void submit();
            }}
          >
            <DialogHeader className="border-b p-5">
              <DialogTitle className="text-base font-medium">{copy.title}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {copy.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 p-5">
              {kind === "mastodon" && (
                <Text
                  id="connect-instance"
                  label="Server"
                  placeholder="mastodon.social"
                  autoComplete="url"
                  value={values.instance ?? ""}
                  onChange={set("instance")}
                />
              )}
              {kind === "bluesky" && (
                <>
                  <Text
                    id="connect-identifier"
                    label="Handle"
                    placeholder="you.bsky.social"
                    autoComplete="username"
                    value={values.identifier ?? ""}
                    onChange={set("identifier")}
                  />
                  <Text
                    id="connect-password"
                    label="App password"
                    type="password"
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    autoComplete="off"
                    value={values.password ?? ""}
                    onChange={set("password")}
                  />
                </>
              )}
              {kind === "telegram" && !telegram && (
                <Text
                  id="connect-chat"
                  label="Channel"
                  placeholder="@yourchannel"
                  value={values.chat ?? ""}
                  onChange={set("chat")}
                />
              )}
              {kind === "telegram" && telegram && (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    To prove you manage{" "}
                    <span className="font-medium text-foreground">{telegram.chat}</span>,
                    add this code anywhere in its description, then verify. You can
                    remove it afterwards.
                  </p>
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3 ring-1 ring-border">
                    <code className="font-mono text-base tabular-nums">
                      {telegram.code}
                    </code>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Copy code"
                      onClick={() =>
                        void navigator.clipboard
                          .writeText(telegram.code)
                          .then(() => toast.success("Code copied"))
                      }
                    >
                      <IconCopy />
                    </Button>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!ready || busy}
              >
                {busy
                  ? "Connecting…"
                  : kind === "mastodon"
                    ? "Continue to sign in"
                    : kind === "telegram" && !telegram
                      ? "Get a code"
                      : kind === "telegram"
                        ? "Verify"
                        : "Connect"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
