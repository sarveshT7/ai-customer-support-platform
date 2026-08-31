import { Kysely, sql, Transaction } from "kysely";
import type { Database, DocumentChunkRow, DocumentRow, NewDocumentChunkRow, NewDocumentRow }
    from "../database/index.js";
import { db } from "../database/kysely/db.js";

type DatabaseExecutor = Kysely<Database> | Transaction<Database>;

export interface SimilarChunk {
    id: string;
    document_id: string;
    document_title: string | null;
    source: string;
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
    async deleteBySource(source: string): Promise<void> {
        await this.database
            .deleteFrom("documents")
            .where("source", "=", source)
            .execute();
    }

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
            .selectFrom("document_chunks as dc")
            .innerJoin("documents as d", "d.id", "dc.document_id")
            .select([
                "dc.id",
                "dc.document_id",
                "d.title as document_title",
                "d.source",
                "dc.chunk_index",
                "dc.content",
                "dc.section",
                "dc.page_number",
                "dc.token_count",
                "dc.metadata",
                "dc.created_at",
            ])
            .select(
                sql<number>`
                dc.embedding <=> ${vector}::vector
            `.as("distance"),
            )
            .where("dc.embedding", "is not", null);

        if (documentId) {
            query = query.where("dc.document_id", "=", documentId);
        }

        if (maxDistance !== undefined) {
            query = query.where(
                sql<boolean>`
                dc.embedding <=> ${vector}::vector <= ${maxDistance}
            `,
            );
        }

        return query
            .orderBy("distance", "asc")
            .limit(topK)
            .execute();
    }
}