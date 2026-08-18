import { describe, expect, it, vi } from "vitest";
import {
    IngestionService,
    IngestDocumentInput,
} from "./ingestion.service.js";
import { DocumentService } from "../services/document.service.js";
import { chunkingOptions } from "../ingestion/config.js";

describe("IngestionService", () => {
    it("persists a parsed and chunked document", async () => {
        const persistDocument = vi.fn().mockResolvedValue({
            document: {
                id: "doc-1",
                title: "Return Policy",
            },
            chunks: [],
        });

        const documentService = {
            persistDocument,
        } as unknown as DocumentService;

        const ingestionService = new IngestionService(
            documentService,
            chunkingOptions,
        );

        const input: IngestDocumentInput = {
            content: `
# Return Policy

Customers can return products within 30 days.

## Refunds

Refunds are processed within 5 business days.
`,
            source: "return-policy.md",
            sourceType: "markdown",
            mimeType: "text/markdown",
        };

        await ingestionService.ingest(input);

        expect(persistDocument).toHaveBeenCalledWith({
            document: {
                title: "Return Policy",
                source: "return-policy.md",
                source_type: "markdown",
                mime_type: "text/markdown",
            },
            chunks: [
                {
                    chunk_index: 0,
                    content: "Customers can return products within 30 days.",
                    section: "Return Policy",
                    token_count: 7,
                },
                {
                    chunk_index: 1,
                    content: "Refunds are processed within 5 business days.",
                    section: "Return Policy > Refunds",
                    token_count: 7,
                },
            ],
        });
    });

    it("returns the persisted document and chunks", async () => {
        const persistedResult = {
            document: {
                id: "doc-1",
                title: "Return Policy",
            },
            chunks: [
                {
                    id: "chunk-1",
                    chunk_index: 0,
                    content: "Customers can return products within 30 days.",
                    section: "Return Policy",
                    token_count: 7,
                },
            ],
        };

        const persistDocument = vi.fn().mockResolvedValue(persistedResult);

        const documentService = {
            persistDocument,
        } as unknown as DocumentService;

        const ingestionService = new IngestionService(
            documentService,
            chunkingOptions,
        );

        const input: IngestDocumentInput = {
            content: "# Return Policy\n\nCustomers can return products within 30 days.",
            source: "return-policy.md",
            sourceType: "markdown",
            mimeType: "text/markdown",
        };

        const result = await ingestionService.ingest(input);

        expect(result).toBe(persistedResult);
    });
});