import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

export function getDb(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) throw new Error("DATABASE_URL is required for the GrideX PostgreSQL database");
  client ??= postgres(databaseUrl, { max: 10, prepare: true });
  return drizzle(client, { schema });
}
