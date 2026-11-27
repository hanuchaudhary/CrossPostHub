import {
  type AuthOptions,
  type ConnectOptions,
  Provider,
  type ProviderConfig,
} from "../lib/provider";
import type { Account, Tokens } from "../lib/types";
import { PublishError } from "../publish/errors";
import { blobs, defaultFetch, send } from "../publish/request";
import type {
  CrossPostProvider,
  Fetch,
  PublishContent,
  PublishResult,
} from "../publish/types";

export type TelegramConfig = ProviderConfig & { botToken: string };

const NEVER_MS = 10 * 365 * 24 * 60 * 60_000;

type Reply<T> = { ok: boolean; result?: T; description?: string };
type Chat = {
  id: number;
  type: string;
  title?: string;
  username?: string;
  description?: string;
};

async function telegram<T>(
  token: string,
  method: string,
  body: Record<string, unknown> | FormData,
  fetcher: Fetch = defaultFetch,
): Promise<T> {
  const reply = await send<Reply<T>>(
    "Telegram",
    method,
    fetcher,
    `https://api.telegram.org/bot${token}/${method}`,
    body instanceof FormData
      ? { method: "POST", body }
      : {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
  ).catch((error: PublishError) => {
    error.message = error.message.replace(token, "<bot token>");
    throw error;
  });
  if (!reply.ok || reply.result === undefined)
    throw new PublishError(`Telegram ${method} failed: ${reply.description ?? "unknown error"}`);
  return reply.result;
}

export function telegramChat(value: string) {
  const raw = value.trim().replace(/^https?:\/\/t\.me\//, "");
  if (/^-?\d+$/.test(raw)) return raw;
  const name = raw.replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{5,32}$/.test(name))
    throw new Error("Enter your channel's @username or its numeric ID");
  return `@${name}`;
}

export class Telegram extends Provider<TelegramConfig> {
  readonly id = "telegram" as const;
  readonly limits = { caption: 1024 };
  readonly accepts = "stream" as const;
  override readonly connection = "form" as const;

  authUrl(_options: AuthOptions): string {
    throw this.invalid("Telegram connects by adding the bot to your channel");
  }

  connect(_options: ConnectOptions): Promise<Account> {
    throw this.invalid("Telegram connects by adding the bot to your channel");
  }

  async chat(value: string) {
    if (!this.config.botToken) throw this.invalid("Telegram is not configured yet");
    let chat: Chat;
    try {
      chat = await telegram<Chat>(this.config.botToken, "getChat", {
        chat_id: telegramChat(value),
      });
    } catch {
      throw this.invalid("The bot can't see that channel. Add it as an admin first");
    }
    return chat;
  }

  override async connectForm(input: Record<string, string>): Promise<Account> {
    const code = input.code ?? "";
    const chat = await this.chat(input.chat ?? "");
    if (chat.type !== "channel" && chat.type !== "supergroup" && chat.type !== "group")
      throw this.invalid("Connect a channel or group");
    if (!code || !chat.description?.includes(code))
      throw this.invalid("Add the code to the channel description, then verify");
    const bot = await telegram<{ id: number }>(this.config.botToken, "getMe", {});
    const member = await telegram<{ status: string; can_post_messages?: boolean }>(
      this.config.botToken,
      "getChatMember",
      { chat_id: chat.id, user_id: bot.id },
    );
    const canPost =
      member.status === "administrator" &&
      (chat.type !== "channel" || member.can_post_messages !== false);
    if (!canPost)
      throw this.invalid("Make the bot an admin that can post messages");
    return {
      id: String(chat.id),
      name: chat.title ?? (chat.username ? `@${chat.username}` : String(chat.id)),
      tokens: {
        accessToken: "telegram-bot",
        expiresAt: new Date(Date.now() + NEVER_MS),
        accountId: String(chat.id),
      },
    };
  }

  async refresh(tokens: Tokens): Promise<Tokens> {
    return tokens;
  }

  async revoke(): Promise<void> {}
}

export class TelegramProvider implements CrossPostProvider {
  readonly name = "telegram";

  constructor(private readonly fetch: Fetch = defaultFetch) {}

  async publish({ account, text, media = [] }: PublishContent): Promise<PublishResult> {
    const token = account.accessToken;
    const chat = account.accountId;
    const files = await blobs(media);
    if (files.length === 0) {
      const response = await telegram(token, "sendMessage", { chat_id: chat, text }, this.fetch);
      return { provider: this.name, response };
    }
    const body = new FormData();
    body.set("chat_id", chat);
    const typeOf = (file: (typeof files)[number]) =>
      file.video ? "video" : file.contentType === "image/gif" ? "animation" : "photo";
    if (files.length === 1) {
      const file = files[0]!;
      const kind = typeOf(file);
      body.set(kind, new Blob([file.data], { type: file.contentType }), `media.${file.contentType.split("/")[1]}`);
      if (text) body.set("caption", text);
      const method = kind === "video" ? "sendVideo" : kind === "animation" ? "sendAnimation" : "sendPhoto";
      const response = await telegram(token, method, body, this.fetch);
      return { provider: this.name, response };
    }
    if (files.some((file) => file.contentType === "image/gif"))
      throw new PublishError("Telegram sends a GIF on its own");
    const group = files.map((file, index) => {
      const name = `file${index}`;
      body.set(name, new Blob([file.data], { type: file.contentType }), `${name}.${file.contentType.split("/")[1]}`);
      return {
        type: file.video ? "video" : "photo",
        media: `attach://${name}`,
        ...(index === 0 && text ? { caption: text } : {}),
      };
    });
    body.set("media", JSON.stringify(group));
    const response = await telegram(token, "sendMediaGroup", body, this.fetch);
    return { provider: this.name, response };
  }
}
