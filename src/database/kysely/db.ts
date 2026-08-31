import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { getPostgresConfig } from "../config.js";
import { Database } from "../types.js";

const config = getPostgresConfig();

const pool = new Pool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

const dialect = new PostgresDialect({ pool });

export const db = new Kysely<Database>({ dialect });

export async function closeDb(): Promise<void> {
  await db.destroy();
}
