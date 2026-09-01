import { DocumentRepository, SimilarChunk } from "../repositories/document.repository.js";
import {
    embeddingService as defaultEmbeddingService,
    EmbeddingService,
} from "../services/embedding.service.js";
import { rerankService as defaultRerankService, RerankService } from "./rerank.service.js";

const DEFAULT_MAX_DISTANCE = 0.5;

// Reranking only has real candidates to choose from if the first-pass vector search casts a
// wider net than the final topK, and with a looser distance filter. The reranker (not the raw
// cosine distance) makes the final relevance call on this wider pool.
const CANDIDATE_MULTIPLIER = Number(
    process.env.RAG_RERANK_CANDIDATE_MULTIPLIER ?? 4,
);
const CANDIDATE_MAX_DISTANCE = Number(
    process.env.RAG_RERANK_CANDIDATE_MAX_DISTANCE ?? 0.8,
);
// The rerank API's top_n always returns its N best-of-what-it-was-given, with no concept of
// "none of these are actually relevant" — so an absolute score floor is required, not just
// top-N selection, or a totally unrelated query would still get padded with irrelevant chunks.
// Calibrated against this project's real corpus: a genuinely relevant top chunk scores ~0.4-0.99,
// same-document-but-off-topic chunks score ~0.02-0.04, and a fully unrelated query's best
// candidate scores ~0.003. 0.05 sits cleanly between "off-topic" and "actually relevant".
const MIN_RELEVANCE_SCORE = Number(
    process.env.RAG_RERANK_MIN_RELEVANCE ?? 0.05,
);

function isRerankEnabled(): boolean {
    return process.env.RAG_RERANK_ENABLED !== "false";
}

export class RetrievalService {
    constructor(
        private readonly embeddingService: EmbeddingService =
            defaultEmbeddingService,
        private readonly documentRepository: DocumentRepository = new DocumentRepository(),
        private readonly rerankService: RerankService = defaultRerankService,
    ) { }

    async retrieve(
        query: string,
        topK = 5,
        documentId?: string,
        maxDistance = DEFAULT_MAX_DISTANCE,
    ): Promise<SimilarChunk[]> {
        const queryEmbedding =
            await this.embeddingService.embedText(query);

        if (!isRerankEnabled()) {
            return this.documentRepository.searchSimilarChunks(
                queryEmbedding,
                topK,
                documentId,
                maxDistance,
            );
        }

        const candidatePoolSize = Math.max(topK * CANDIDATE_MULTIPLIER, topK);
        const candidateMaxDistance = Math.max(maxDistance, CANDIDATE_MAX_DISTANCE);

        const candidates = await this.documentRepository.searchSimilarChunks(
            queryEmbedding,
            candidatePoolSize,
            documentId,
            candidateMaxDistance,
        );

        const reranked = await this.rerankService.rerank(query, candidates, topK);

        const rerankSucceeded = reranked.some(
            (result) => result.relevanceScore !== null,
        );

        // If reranking actually ran, trust its relevance judgment over raw cosine distance —
        // that's the whole point — but still drop anything below the absolute relevance floor
        // (see MIN_RELEVANCE_SCORE) rather than unconditionally padding to topK. If reranking
        // fell back to original vector-search order (no scores), re-apply the caller's original
        // (tighter) maxDistance so a rerank outage doesn't silently widen what counts as
        // "relevant" for callers relying on that threshold (e.g. "no relevant context" cases).
        return rerankSucceeded
            ? reranked
                .filter((result) => (result.relevanceScore ?? 0) >= MIN_RELEVANCE_SCORE)
                .map((result) => result.item)
            : reranked
                .map((result) => result.item)
                .filter((item) => item.distance <= maxDistance);
    }
}

export const retrievalService = new RetrievalService();
