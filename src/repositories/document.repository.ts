import { Kysely, sql, Transaction } from "kysely";
import type { Database, DocumentChunkRow, DocumentRow, NewDocumentChunkRow, NewDocumentRow }
    from "../database/index.js";
import { db } from "../database/kysely/db.js";

type DatabaseExecutor = Kysely<Database> | Transaction<Database>;

export interface SimilarChunk {
    id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    section: string | null;
    page_number: number | null;
    token_count: number | null;
    metadata: Record<string, unknown>;
    created_at: Date;
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
        maxDistance?: number,
    ): Promise<SimilarChunk[]> {
        const vector = `[${queryEmbedding.join(",")}]`;

        let query = this.database
            .selectFrom("document_chunks")
            .select([
                "id",
                "document_id",
                "chunk_index",
                "content",
                "section",
                "page_number",
                "token_count",
                "metadata",
                "created_at",
            ])
            .select(
                sql<number>`embedding <=> ${vector}::vector`.as("distance"),
            )
            .where("embedding", "is not", null)

        if (documentId) {
            query = query.where("document_id", "=", documentId);
        }

        if (maxDistance !== undefined) {
            query = query.where(
                sql<boolean>`embedding <=> ${vector}::vector <= ${maxDistance}`,
            );
        }
        return query
            .orderBy("distance", "asc")
            .limit(topK)
            .execute();
    }
}