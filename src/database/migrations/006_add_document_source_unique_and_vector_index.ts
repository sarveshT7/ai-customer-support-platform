import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Collapse pre-existing duplicate sources (from repeated manual ingestion before
    // this constraint existed) down to the most recent row per source before enforcing
    // uniqueness. Chunks of the removed duplicates cascade-delete automatically.
    await sql`
        DELETE FROM documents
        WHERE id NOT IN (
            SELECT DISTINCT ON (source) id
            FROM documents
            ORDER BY source, created_at DESC, id DESC
        )
    `.execute(db);

    await db.schema
        .alterTable("documents")
        .addUniqueConstraint("documents_source_unique", ["source"])
        .execute();

    await sql`
        CREATE INDEX document_chunks_embedding_hnsw_idx
        ON document_chunks
        USING hnsw (embedding vector_cosine_ops)
    `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`DROP INDEX IF EXISTS document_chunks_embedding_hnsw_idx`.execute(db);

    await db.schema
        .alterTable("documents")
        .dropConstraint("documents_source_unique")
        .execute();
}
