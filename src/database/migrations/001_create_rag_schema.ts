import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  await db.schema
    .createTable("documents")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("title", "text")
    .addColumn("source", "text", (col) => col.notNull())
    .addColumn("source_type", "text")
    .addColumn("mime_type", "text")
    .addColumn("metadata", "jsonb", (col) =>
      col.notNull().defaultTo(sql`'{}'::jsonb`)
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createTable("document_chunks")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn("document_id", "uuid", (col) =>
      col.notNull().references("documents.id").onDelete("cascade")
    )
    .addColumn("chunk_index", "integer", (col) => col.notNull())
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("section", "text")
    .addColumn("page_number", "integer")
    .addColumn("token_count", "integer")
    .addColumn("embedding", sql`vector`)
    .addColumn("metadata", "jsonb", (col) =>
      col.notNull().defaultTo(sql`'{}'::jsonb`)
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  await db.schema
    .createIndex("idx_documents_source")
    .on("documents")
    .column("source")
    .execute();

  await db.schema
    .createIndex("idx_documents_source_type")
    .on("documents")
    .column("source_type")
    .execute();

  await db.schema
    .createIndex("idx_documents_metadata")
    .on("documents")
    .using("gin")
    .column("metadata")
    .execute();

  await db.schema
    .createIndex("idx_document_chunks_document_id_chunk_index")
    .on("document_chunks")
    .columns(["document_id", "chunk_index"])
    .unique()
    .execute();

  await db.schema
    .createIndex("idx_document_chunks_document_id_page_number")
    .on("document_chunks")
    .columns(["document_id", "page_number"])
    .execute();

  await db.schema
    .createIndex("idx_document_chunks_metadata")
    .on("document_chunks")
    .using("gin")
    .column("metadata")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("document_chunks").ifExists().execute();
  await db.schema.dropTable("documents").ifExists().execute();
  await sql`DROP EXTENSION IF EXISTS vector`.execute(db);
}
