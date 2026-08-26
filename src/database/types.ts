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

export interface ProductsTable {
  product_id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  rating: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface OrdersTable {
  order_id: string;
  customer: string;
  status: string;
  expected_delivery: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface TicketsTable {
  ticket_id: string;
  issue: string;
  category: string;
  order_id: string;
  priority: string;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface Database {
  documents: DocumentsTable;
  document_chunks: DocumentChunksTable;
  products: ProductsTable;
  orders: OrdersTable;
  tickets: TicketsTable;
}

export type DocumentRow = Selectable<DocumentsTable>;
export type NewDocumentRow = Insertable<DocumentsTable>;
export type DocumentRowUpdate = Updateable<DocumentsTable>;

export type DocumentChunkRow = Selectable<DocumentChunksTable>;
export type NewDocumentChunkRow = Insertable<DocumentChunksTable>;
export type DocumentChunkRowUpdate = Updateable<DocumentChunksTable>;

export type ProductRow = Selectable<ProductsTable>;
export type NewProductRow = Insertable<ProductsTable>;
export type ProductRowUpdate = Updateable<ProductsTable>;

export type OrderRow = Selectable<OrdersTable>;
export type NewOrderRow = Insertable<OrdersTable>;
export type OrderRowUpdate = Updateable<OrdersTable>;

export type TicketRow = Selectable<TicketsTable>;
export type NewTicketRow = Insertable<TicketsTable>;
export type TicketRowUpdate = Updateable<TicketsTable>;
