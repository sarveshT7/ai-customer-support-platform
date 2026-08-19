import { db } from "../database/kysely/db.js";
import { DocumentRepository } from "../repositories/document.repository.js";

export class DocumentService {
    async persistDocument(input: {
        document: {
            title?: string | null;
            source: string;
            source_type?: string | null;
            mime_type?: string | null;
            metadata?: Record<string, unknown>;
        };
        chunks: {
            chunk_index: number;
            content: string;
            section?: string | null;
            page_number?: number | null;
            token_count?: number | null;
            embedding?: string | number[] | null;
            metadata?: Record<string, unknown>;
        }[];
    }) {
        return await db.transaction().execute(async (trx) => {
            const documentRepository = new DocumentRepository(trx);

            const document = await documentRepository.createDocument({
                ...input.document,
                metadata: input.document.metadata ?? {},
            });

            const chunks = await documentRepository.createChunks(
                input.chunks.map((chunk) => ({
                    ...chunk,
                    document_id: document.id,
                    embedding: Array.isArray(chunk.embedding)
                        ? `[${chunk.embedding.join(",")}]`
                        : chunk.embedding,
                    metadata: chunk.metadata ?? {},
                })),
            );

            return {
                document,
                chunks,
            };
        });
    }
}

export const documentService = new DocumentService();