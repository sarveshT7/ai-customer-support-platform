import { DocumentChunkRow, DocumentRow } from "../database/index.js";
import { chunkBlocks, ChunkingOptions } from "../ingestion/chunking/chunker.js";
import { cleanText } from "../ingestion/cleaning/test.cleaner.js";
import { chunkingOptions } from "../ingestion/config.js";
import { parseMarkdown } from "../ingestion/parsers/markdown.parser.js";
import { documentService, DocumentService } from "./document.service.js";
import { embeddingService, EmbeddingService } from "./embedding.service.js";

export interface IngestDocumentInput {
    content: string;
    source: string;
    sourceType: string;
    mimeType: string;
}

export interface IngestDocumentResult {
    document: DocumentRow;
    chunks: DocumentChunkRow[];
}

export class IngestionService {
    constructor(
        private readonly documentService: DocumentService,
        private readonly embeddingService: EmbeddingService,
        private readonly chunkingOptions: ChunkingOptions,
    ) { }

    async ingest(input: IngestDocumentInput): Promise<IngestDocumentResult> {
        const cleanedContent = cleanText(input.content);

        const parsedDocument = parseMarkdown(cleanedContent);

        // Temporary placeholder until we add chunking + persistence.
        const preparedChunks = chunkBlocks(
            parsedDocument.blocks,
            this.chunkingOptions,
        );

        const embeddings = await this.embeddingService.embedTexts(
            preparedChunks.map((chunk) => chunk.content)
        )


        if (embeddings.length !== preparedChunks.length) {
            throw new Error(
                `Embedding count mismatch: expected ${preparedChunks.length}, received ${embeddings.length}`,
            );
        }

        const result = await this.documentService.persistDocument({
            document: {
                title: parsedDocument.title,
                source: input.source,
                source_type: input.sourceType,
                mime_type: input.mimeType,
            },
            chunks: preparedChunks.map((chunk, index) => ({
                chunk_index: chunk.chunkIndex,
                content: chunk.content,
                section: chunk.section,
                token_count: chunk.tokenCount,
                embedding: embeddings[index],
            })),
        });

        return result
    }
}

export const ingestionService = new IngestionService(
    documentService,
    embeddingService,
    chunkingOptions,
);