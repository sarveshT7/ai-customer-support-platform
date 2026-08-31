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

const knownAnswerCases: EvaluationCase[] = [
    { query: "Can I return a product within 30 days?", expectedChunkIndex: 0 },
    {
        query: "How long after purchase can I return something?",
        expectedChunkIndex: 0,
    },
    { query: "When will I receive my refund?", expectedChunkIndex: 2 },
    { query: "How long does an approved refund take?", expectedChunkIndex: 2 },
    {
        query: "How many days do I have to report a damaged product?",
        expectedChunkIndex: 1,
    },
];

const noContextCases: EvaluationCase[] = [
    { query: "What is the warranty period?", expectedChunkIndex: null },
];

describe("Retrieval evaluation (return-policy.md)", () => {
    beforeAll(async () => {
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
