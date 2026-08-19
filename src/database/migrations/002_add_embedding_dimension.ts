import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await sql`
        ALTER TABLE document_chunks
        ALTER COLUMN embedding TYPE vector(1536)
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`
        ALTER TABLE document_chunks
        ALTER COLUMN embedding TYPE vector
    `.execute(db);
}