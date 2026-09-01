import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RetrievalService } from "./retrieval.service.js";
import { EmbeddingService } from "../services/embedding.service.js";
import { DocumentRepository, SimilarChunk } from "../repositories/document.repository.js";
import { RerankService } from "./rerank.service.js";

function makeChunk(overrides: Partial<SimilarChunk>): SimilarChunk {
    return {
        id: "chunk-1",
        document_id: "document-1",
        document_title: "Return Policy",
        source: "return-policy.md",
        chunk_index: 0,
        content: "Customers can return products within 30 days.",
        section: "Returns",
        page_number: null,
        token_count: 8,
        metadata: {},
        created_at: new Date(),
        distance: 0.12,
        ...overrides,
    };
}

describe("RetrievalService", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        delete process.env.RAG_RERANK_ENABLED;
        delete process.env.RAG_RERANK_CANDIDATE_MULTIPLIER;
        delete process.env.RAG_RERANK_CANDIDATE_MAX_DISTANCE;
        delete process.env.RAG_RERANK_MIN_RELEVANCE;
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    function makeService(
        similarChunks: SimilarChunk[],
        rerankImpl?: RerankService["rerank"],
    ) {
        const embeddingService = {
            embedText: vi.fn().mockResolvedValue(Array(1536).fill(0)),
            embedTexts: vi.fn(),
        } as EmbeddingService;

        const documentRepository = {
            searchSimilarChunks: vi.fn().mockResolvedValue(similarChunks),
        } as unknown as DocumentRepository;

        const rerankService = {
            rerank:
                rerankImpl ??
                vi
                    .fn()
                    .mockImplementation(async (_query: string, candidates: SimilarChunk[]) =>
                        candidates.map((item) => ({ item, relevanceScore: null })),
                    ),
        } as unknown as RerankService;

        const service = new RetrievalService(
            embeddingService,
            documentRepository,
            rerankService,
        );

        return { service, embeddingService, documentRepository, rerankService };
    }

    describe("with reranking enabled (default)", () => {
        it("widens the candidate pool before reranking, then returns the reranked order", async () => {
            const candidates = [
                makeChunk({ chunk_index: 0, distance: 0.3 }),
                makeChunk({ chunk_index: 1, distance: 0.4 }),
                makeChunk({ chunk_index: 2, distance: 0.6 }),
            ];

            const rerankImpl = vi
                .fn()
                .mockResolvedValue([
                    { item: candidates[2], relevanceScore: 0.9 },
                    { item: candidates[0], relevanceScore: 0.5 },
                ]);

            const { service, embeddingService, documentRepository, rerankService } =
                makeService(candidates, rerankImpl);

            const result = await service.retrieve("Can I return a product?", 2);

            expect(embeddingService.embedText).toHaveBeenCalledWith(
                "Can I return a product?",
            );

            // topK=2 -> pool = 2 * 4 = 8, and the distance filter widens to 0.8.
            expect(documentRepository.searchSimilarChunks).toHaveBeenCalledWith(
                expect.any(Array),
                8,
                undefined,
                0.8,
            );

            expect(rerankService.rerank).toHaveBeenCalledWith(
                "Can I return a product?",
                candidates,
                2,
            );

            expect(result).toEqual([candidates[2], candidates[0]]);
        });

        it("re-applies the original maxDistance when reranking falls back to raw order", async () => {
            const candidates = [
                makeChunk({ chunk_index: 0, distance: 0.3 }),
                makeChunk({ chunk_index: 1, distance: 0.6 }), // beyond the original 0.5 threshold
            ];

            const { service } = makeService(candidates); // default rerank impl: relevanceScore null (fallback)

            const result = await service.retrieve("query", 5, undefined, 0.5);

            expect(result).toEqual([candidates[0]]);
        });

        it("passes documentId through to the widened candidate search", async () => {
            const { service, documentRepository } = makeService([]);

            await service.retrieve("query", 3, "document-123");

            expect(documentRepository.searchSimilarChunks).toHaveBeenCalledWith(
                expect.any(Array),
                12,
                "document-123",
                0.8,
            );
        });

        it("never widens the distance filter below the caller-supplied maxDistance", async () => {
            const { service, documentRepository } = makeService([]);

            await service.retrieve("query", 5, undefined, 0.9);

            expect(documentRepository.searchSimilarChunks).toHaveBeenCalledWith(
                expect.any(Array),
                20,
                undefined,
                0.9,
            );
        });

        it("drops reranked results below the minimum relevance score, even when reranking succeeded", async () => {
            // Regression: the rerank API's top_n always returns its N best-of-what-it-was-given
            // — it has no concept of "none of these are relevant" — so a completely unrelated
            // query would otherwise get padded with topK irrelevant chunks instead of finding
            // nothing, breaking "no relevant context" grounding behavior.
            const candidates = [
                makeChunk({ chunk_index: 0 }),
                makeChunk({ chunk_index: 1 }),
                makeChunk({ chunk_index: 2 }),
            ];

            const rerankImpl = vi.fn().mockResolvedValue([
                { item: candidates[0], relevanceScore: 0.003 },
                { item: candidates[1], relevanceScore: 0.002 },
                { item: candidates[2], relevanceScore: 0.001 },
            ]);

            const { service } = makeService(candidates, rerankImpl);

            const result = await service.retrieve("Do you offer price matching?", 5);

            expect(result).toEqual([]);
        });

        it("keeps only the results at or above the minimum relevance score", async () => {
            const candidates = [
                makeChunk({ chunk_index: 0 }),
                makeChunk({ chunk_index: 1 }),
                makeChunk({ chunk_index: 2 }),
            ];

            const rerankImpl = vi.fn().mockResolvedValue([
                { item: candidates[0], relevanceScore: 0.99 },
                { item: candidates[1], relevanceScore: 0.44 },
                { item: candidates[2], relevanceScore: 0.03 },
            ]);

            const { service } = makeService(candidates, rerankImpl);

            const result = await service.retrieve("query", 5);

            expect(result).toEqual([candidates[0], candidates[1]]);
        });
    });

    describe("with reranking disabled", () => {
        it("falls back to the original single-pass search behavior untouched", async () => {
            process.env.RAG_RERANK_ENABLED = "false";
            const similarChunks = [makeChunk({})];
            const { service, documentRepository, rerankService } = makeService(similarChunks);

            const result = await service.retrieve("Can I return a product?", 5);

            expect(documentRepository.searchSimilarChunks).toHaveBeenCalledWith(
                expect.any(Array),
                5,
                undefined,
                0.5,
            );
            expect(rerankService.rerank).not.toHaveBeenCalled();
            expect(result).toEqual(similarChunks);
        });
    });
});
