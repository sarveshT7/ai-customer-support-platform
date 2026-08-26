export { db, closeDb } from "./kysely/db.js";
export { getPostgresConfig } from "./config.js";
export type {
  Database,
  DocumentRow,
  NewDocumentRow,
  DocumentRowUpdate,
  DocumentChunkRow,
  NewDocumentChunkRow,
  DocumentChunkRowUpdate,
  ProductRow,
  NewProductRow,
  ProductRowUpdate,
  OrderRow,
  NewOrderRow,
  OrderRowUpdate,
  TicketRow,
  NewTicketRow,
  TicketRowUpdate,
} from "./types.js";
