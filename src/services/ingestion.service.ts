import { DocumentChunkRow, DocumentRow } from "../database/index.js";
import { chunkBlocks, ChunkingOptions } from "../ingestion/chunking/chunker.js";
import { cleanText } from "../ingestion/cleaning/test.cleaner.js";
import { chunkingOptions } from "../ingestion/config.js";
import { parseMarkdown } from "../ingestion/parsers/markdown.parser.js";
import { documentService, DocumentService } from "./document.service.js";

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

        const result = await this.documentService.persistDocument({
            document: {
                title: parsedDocument.title,
                source: input.source,
                source_type: input.sourceType,
                mime_type: input.mimeType,
            },
            chunks: preparedChunks.map((chunk) => ({
                chunk_index: chunk.chunkIndex,
                content: chunk.content,
                section: chunk.section,
                token_count: chunk.tokenCount,
            })),
        });

        return result
    }
}

export const ingestionService = new IngestionService(
    documentService,
    chunkingOptions,
);