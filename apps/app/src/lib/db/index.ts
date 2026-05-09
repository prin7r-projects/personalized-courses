import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb(): Db {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  _client = postgres(databaseUrl, { max: 10 });
  _db = drizzle(_client, { schema });
  return _db;
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}

// Legacy export for consumers that use `import { db }`
// Lazily resolved on first property access
const dbProxy: Db = new Proxy({} as Db, {
  get(_target, prop: string | symbol) {
    const real = getDb();
    const v = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === "function" ? (v as Function).bind(real) : v;
  },
});

export const db = dbProxy;

export * from "./schema";
