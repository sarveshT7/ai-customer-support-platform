import { describe, expect, it, vi } from "vitest";
import { RetrievalService } from "./retrieval.service.js";
import { EmbeddingService } from "../services/embedding.service.js";
import { DocumentRepository, SimilarChunk } from "../repositories/document.repository.js";

describe("RetrievalService", () => {
    it("embeds the query and searches for similar chunks", async () => {
        const queryEmbedding = Array(1536).fill(0);
        queryEmbedding[0] = 1;

        const similarChunks = [
            {
                id: "chunk-1",
                document_id: "document-1",
                chunk_index: 0,
                content: "Customers can return products within 30 days.",
                section: "Returns",
                page_number: null,
                token_count: 8,
                embedding: null,
                metadata: {},
                created_at: new Date(),
                distance: 0.12,
            },
        ];

        const embeddingService = {
            embedText: vi.fn().mockResolvedValue(queryEmbedding),
            embedTexts: vi.fn(),
        } as EmbeddingService;


        const documentRepository = {
            searchSimilarChunks: vi.fn().mockResolvedValue(similarChunks),
        } as unknown as DocumentRepository;

        const service = new RetrievalService(
            embeddingService,
            documentRepository,
        );

        const result = await service.retrieve(
            "Can I return a product?",
            5,
        );

        expect(embeddingService.embedText).toHaveBeenCalledWith(
            "Can I return a product?",
        );

        expect(
            documentRepository.searchSimilarChunks,
        ).toHaveBeenCalledWith(
            queryEmbedding,
            5,
            undefined,
            0.5,
        );

        expect(result).toEqual(similarChunks);
    });

    it("passes documentId when provided", async () => {
        const queryEmbedding = Array(1536).fill(0);
        queryEmbedding[0] = 1;

        const similarChunks: SimilarChunk[] = [];

        const embeddingService = {
            embedText: vi.fn().mockResolvedValue(queryEmbedding),
            embedTexts: vi.fn(),
        } as EmbeddingService;

        const documentRepository = {
            searchSimilarChunks: vi.fn().mockResolvedValue(similarChunks),
        } as unknown as DocumentRepository;

        const service = new RetrievalService(
            embeddingService,
            documentRepository,
        );

        const result = await service.retrieve(
            "What is the return policy?",
            3,
            "document-123",
        );

        expect(embeddingService.embedText).toHaveBeenCalledWith(
            "What is the return policy?",
        );

        expect(
            documentRepository.searchSimilarChunks,
        ).toHaveBeenCalledWith(
            queryEmbedding,
            3,
            "document-123",
            0.5,
        );

        expect(result).toEqual(similarChunks);
    });

    it("passes maxDistance when provided", async () => {
        const queryEmbedding = Array(1536).fill(0);
        queryEmbedding[0] = 1;

        const similarChunks: SimilarChunk[] = [];

        const embeddingService = {
            embedText: vi.fn().mockResolvedValue(queryEmbedding),
            embedTexts: vi.fn(),
        } as EmbeddingService;

        const documentRepository = {
            searchSimilarChunks: vi.fn().mockResolvedValue(similarChunks),
        } as unknown as DocumentRepository;

        const service = new RetrievalService(
            embeddingService,
            documentRepository,
        );

        const result = await service.retrieve(
            "What is the return policy?",
            5,
            undefined,
            0.4,
        );

        expect(embeddingService.embedText).toHaveBeenCalledWith(
            "What is the return policy?",
        );

        expect(
            documentRepository.searchSimilarChunks,
        ).toHaveBeenCalledWith(
            queryEmbedding,
            5,
            undefined,
            0.4,
        );

        expect(result).toEqual(similarChunks);
    });
});