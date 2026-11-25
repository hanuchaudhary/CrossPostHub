import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function key(raw: string | undefined) {
  if (!raw) throw new Error("SOCIAL_TOKEN_KEY is not set");
  const value = Buffer.from(raw, "base64");
  if (value.length !== 32) {
    throw new Error("SOCIAL_TOKEN_KEY must be 32 bytes, base64 encoded");
  }
  return value;
}

export function encrypt(plain: string, secret: string | undefined): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key(secret), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [VERSION, iv, data, cipher.getAuthTag()]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url"),
    )
    .join(":");
}

export function decrypt(value: string, secret: string | undefined): string {
  const [version, iv, data, tag] = value.split(":");
  if (version !== VERSION || !iv || !data || !tag) {
    throw new Error("Not an encrypted token");
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    key(secret),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
