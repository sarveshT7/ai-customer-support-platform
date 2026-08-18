import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const postgresEnvSchema = z.object({
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DB: z.string().min(1),
});
function fromDatabaseUrl(databaseUrl) {
    const url = new URL(databaseUrl);
    if (!url.hostname || !url.username || !url.pathname.replace(/^\//, "")) {
        throw new Error("DATABASE_URL must include host, user, and database name (postgresql://user:password@host:port/database)");
    }
    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : 5432,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
    };
}
export function getPostgresConfig() {
    if (process.env.DATABASE_URL) {
        return fromDatabaseUrl(process.env.DATABASE_URL);
    }
    const parsed = postgresEnvSchema.safeParse(process.env);
    if (!parsed.success) {
        const details = parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ");
        throw new Error(`Invalid PostgreSQL environment variables: ${details}. Set POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB, or provide DATABASE_URL.`);
    }
    return {
        host: parsed.data.POSTGRES_HOST,
        port: parsed.data.POSTGRES_PORT,
        user: parsed.data.POSTGRES_USER,
        password: parsed.data.POSTGRES_PASSWORD,
        database: parsed.data.POSTGRES_DB,
    };
}
