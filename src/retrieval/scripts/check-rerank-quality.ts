// Manual, deliberately-run script — NOT part of the automated test suite. Exercises the real
// OpenRouter rerank endpoint (free tier, rate-limited) to compare raw vector-search order
// against reranked order for a fixed set of queries. Run only when you want to spend rerank
// quota checking quality: npx tsx src/retrieval/scripts/check-rerank-quality.ts

import { DocumentRepository } from "../../repositories/document.repository.js";
import { embeddingService } from "../../services/embedding.service.js";
import { rerankService } from "../rerank.service.js";

const QUERIES = [
    "Can I return a product within 30 days?",
    "How long do I have to report a damaged product?",
    "How long does an approved refund take?",
    "Can I exchange my product?",
    "What is the warranty period?",
    "Do you offer price matching with competitors?",
];

const CANDIDATE_POOL = 20;
const CANDIDATE_MAX_DISTANCE = 0.8;
const TOP_K = 5;

const documentRepository = new DocumentRepository();

function preview(content: string, length = 70): string {
    const trimmed = content.trim();
    return trimmed.length > length ? `${trimmed.slice(0, length)}...` : trimmed;
}

for (const query of QUERIES) {
    const queryEmbedding = await embeddingService.embedText(query);
    const candidates = await documentRepository.searchSimilarChunks(
        queryEmbedding,
        CANDIDATE_POOL,
        undefined,
        CANDIDATE_MAX_DISTANCE,
    );

    console.log(`\n${"=".repeat(80)}`);
    console.log(`Query: ${query}`);
    console.log(`Candidates considered: ${candidates.length}`);

    console.log("\nBefore rerank (raw vector distance order):");
    candidates.slice(0, TOP_K).forEach((c, i) => {
        console.log(
            `  ${i + 1}. chunk=${c.chunk_index} distance=${c.distance.toFixed(4)}  ${preview(c.content)}`,
        );
    });

    const reranked = await rerankService.rerank(query, candidates, TOP_K);
    const usedRerank = reranked.some((r) => r.relevanceScore !== null);

    console.log(
        `\nAfter rerank (${usedRerank ? "live rerank scores" : "FELL BACK — rerank unavailable"}):`,
    );
    if (reranked.length === 0) {
        console.log("  (no results above the relevance floor)");
    }
    reranked.forEach((r, i) => {
        const score =
            r.relevanceScore !== null ? r.relevanceScore.toFixed(4) : "n/a (fallback)";
        console.log(
            `  ${i + 1}. chunk=${r.item.chunk_index} score=${score}  ${preview(r.item.content)}`,
        );
    });

    const beforeOrder = candidates.slice(0, TOP_K).map((c) => c.chunk_index);
    const afterOrder = reranked.map((r) => r.item.chunk_index);
    const orderChanged = beforeOrder.join(",") !== afterOrder.join(",");

    console.log(
        `\nRanking changed: ${orderChanged ? "YES" : "NO"}` +
        (orderChanged
            ? ` — before: [${beforeOrder.join(", ")}] -> after: [${afterOrder.join(", ")}]`
            : ` — order unchanged: [${beforeOrder.join(", ")}]`),
    );
}

process.exit(0);
