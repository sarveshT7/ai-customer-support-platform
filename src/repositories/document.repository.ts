import { Kysely, sql, Transaction } from "kysely";
import type { Database, DocumentChunkRow, DocumentRow, NewDocumentChunkRow, NewDocumentRow }
    from "../database/index.js";
import { db } from "../database/kysely/db.js";


type DatabaseExecutor = Kysely<Database> | Transaction<Database>;

export interface SimilarChunk extends DocumentChunkRow {
    distance: number;
}

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
    async searchSimilarChunks(
        queryEmbedding: number[],
        topK: number,
        documentId?: string,
    ): Promise<SimilarChunk[]> {
        const vector = `[${queryEmbedding.join(",")}]`;

        let query = this.database
            .selectFrom("document_chunks")
            .selectAll()
            .select(
                sql<number>`embedding <=> ${vector}::vector`.as("distance"),
            )
            .where("embedding", "is not", null)

        if (documentId) {
            query = query.where("document_id", "=", documentId);
        }
        return query.orderBy("distance", "asc")
            .limit(topK)
            .execute();
    }
}