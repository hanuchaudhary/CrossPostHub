import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const clients = new Map<string, PrismaClient>();

export function getDb(databaseUrl: string) {
  const existing = clients.get(databaseUrl);
  if (existing) return existing;
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const client = new PrismaClient({ adapter });
  clients.set(databaseUrl, client);
  return client;
}
