import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "../../generated/prisma/client";

const clients = new WeakMap<object, PrismaClient>();

export function getDb(database: D1Database) {
  const existing = clients.get(database);
  if (existing) return existing;
  const client = new PrismaClient({ adapter: new PrismaD1(database) });
  clients.set(database, client);
  return client;
}
