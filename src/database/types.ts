import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";

type JsonObject = Record<string, unknown>;

export interface DocumentsTable {
  id: Generated<string>;
  title: string | null;
  source: string;
  source_type: string | null;
  mime_type: string | null;
  metadata: ColumnType<JsonObject, JsonObject | undefined, JsonObject>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface DocumentChunksTable {
  id: Generated<string>;
  document_id: string;
  chunk_index: number;
  content: string;
  section: string | null;
  page_number: number | null;
  token_count: number | null;
  /**
   * pgvector column. Dimension is left unspecified until an embedding
   * model is chosen. node-pg returns the value as a string unless a
   * parser is registered later.
   */
  embedding: ColumnType<
    string | null,
    string | number[] | null,
    string | number[] | null
  >;
  metadata: ColumnType<JsonObject, JsonObject | undefined, JsonObject>;
  created_at: Generated<Date>;
}

export interface Database {
  documents: DocumentsTable;
  document_chunks: DocumentChunksTable;
}

export type DocumentRow = Selectable<DocumentsTable>;
export type NewDocumentRow = Insertable<DocumentsTable>;
export type DocumentRowUpdate = Updateable<DocumentsTable>;

export type DocumentChunkRow = Selectable<DocumentChunksTable>;
export type NewDocumentChunkRow = Insertable<DocumentChunksTable>;
export type DocumentChunkRowUpdate = Updateable<DocumentChunksTable>;
