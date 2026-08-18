import { Kysely, Transaction } from "kysely";
import type { Database, DocumentChunkRow, DocumentRow, NewDocumentChunkRow, NewDocumentRow }
    from "../database/index.js";
import { db } from "../database/kysely/db.js";


type DatabaseExecutor = Kysely<Database> | Transaction<Database>;

export class DocumentRepository {
    constructor(
        private readonly database: DatabaseExecutor = db,
    ) { }
    async createDocument(input: NewDocumentRow): Promise<DocumentRow> {
        return this.database
            .insertInto("documents")
            .values(input)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async createChunks(
        chunks: NewDocumentChunkRow[],
    ): Promise<DocumentChunkRow[]> {
        return this.database
            .insertInto("document_chunks")
            .values(chunks)
            .returningAll()
            .execute();
    }
}