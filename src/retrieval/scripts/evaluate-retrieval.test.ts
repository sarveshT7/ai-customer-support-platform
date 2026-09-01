import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { closeDb, db } from "../../database/kysely/db.js";
import { ingestionService } from "../../ingestion/index.js";
import { retrievalService } from "../retrieval.service.js";

const SOURCE = "eval-return-policy.md";
const RETURN_POLICY_PATH = fileURLToPath(
    new URL("../../data/documents/return-policy.md", import.meta.url)
);
const TOP_K = 5;

type EvaluationCase = { query: string; expectedChunkIndex: number | null };

// return-policy.md was substantially expanded to 11 sections; chunk indices below reflect
// that current structure (verified against actual chunkBlocks() output, not assumed).
const knownAnswerCases: EvaluationCase[] = [
    { query: "Can I return a product within 30 days?", expectedChunkIndex: 0 },
    {
        query: "How long after purchase can I return something?",
        expectedChunkIndex: 0,
    },
    { query: "When will I receive my refund?", expectedChunkIndex: 3 },
    { query: "How long does an approved refund take?", expectedChunkIndex: 3 },
    {
        query: "How many days do I have to report a damaged product?",
        expectedChunkIndex: 1,
    },
    { query: "Can I exchange my product?", expectedChunkIndex: 5 },
    { query: "What is the warranty period?", expectedChunkIndex: 6 },
];

const noContextCases: EvaluationCase[] = [
    {
        query: "Do you offer price matching with competitors?",
        expectedChunkIndex: null,
    },
];

describe("Retrieval evaluation (return-policy.md)", () => {
    const originalRerankEnabled = process.env.RAG_RERANK_ENABLED;

    beforeAll(async () => {
        // This suite evaluates raw vector-search quality and runs on every `npm test`.
        // Reranking calls the real (free-tier, rate-limited) OpenRouter rerank endpoint —
        // disable it here so routine test runs never consume that shared quota. Real rerank
        // quality is checked deliberately via scripts/check-rerank-quality.ts instead.
        process.env.RAG_RERANK_ENABLED = "false";

        // Idempotent: clear out any leftover rows from a prior interrupted run.
        await db.deleteFrom("documents").where("source", "=", SOURCE).execute();

        const content = await readFile(RETURN_POLICY_PATH, "utf-8");
        await ingestionService.ingest({
            content,
            source: SOURCE,
            sourceType: "markdown",
            mimeType: "text/markdown",
        });
    }, 30_000);

    afterAll(async () => {
        if (originalRerankEnabled === undefined) {
            delete process.env.RAG_RERANK_ENABLED;
        } else {
            process.env.RAG_RERANK_ENABLED = originalRerankEnabled;
        }

        await db.deleteFrom("documents").where("source", "=", SOURCE).execute();
        await closeDb();
    });

    it.each(knownAnswerCases)(
        `ranks the expected chunk top-1 and within top-${TOP_K} for: $query`,
        async ({ query, expectedChunkIndex }) => {
            const results = await retrievalService.retrieve(query, TOP_K);

            expect(results[0]?.chunk_index).toBe(expectedChunkIndex);
            expect(
                results.some((result) => result.chunk_index === expectedChunkIndex)
            ).toBe(true);
        },
        10_000
    );

    it.each(noContextCases)(
        "finds no confidently relevant chunk for out-of-scope query: $query",
        async ({ query }) => {
            const results = await retrievalService.retrieve(query, TOP_K);
            const hasRelevantResult = results.some(
                (result) => result.distance <= 0.5
            );

            expect(hasRelevantResult).toBe(false);
        },
        10_000
    );
});
