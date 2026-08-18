import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { getPostgresConfig } from "../config.js";
const config = getPostgresConfig();
const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
});
pool.on("error", (error) => {
    console.error("PostgreSQL pool error:", error);
});
const dialect = new PostgresDialect({ pool });
export const db = new Kysely({ dialect });
export async function closeDb() {
    await db.destroy();
}
