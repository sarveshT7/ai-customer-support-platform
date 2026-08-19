import { afterAll, afterEach, describe, expect, it } from "vitest";
import { closeDb, db } from "../../database/kysely/db.js";
import { DocumentRepository } from "../../repositories/document.repository.js";

describe("DocumentRepository", () => {
    const repository = new DocumentRepository();

    afterAll(async () => {
        await closeDb();
    });

    afterEach(async () => {
        await db.deleteFrom("documents").execute();
    });

    it("creates and returns a document", async () => {
        const document = await repository.createDocument({
            title: "Return Policy",
            source: "return-policy.md",
            source_type: "markdown",
            mime_type: "text/markdown",
            metadata: {},
        });

        expect(document.id).toBeDefined();
        expect(document.title).toBe("Return Policy");
        expect(document.source).toBe("return-policy.md");
        expect(document.source_type).toBe("markdown");
        expect(document.mime_type).toBe("text/markdown");
        expect(document.metadata).toEqual({});
        expect(document.created_at).toBeInstanceOf(Date);
        expect(document.updated_at).toBeInstanceOf(Date);
    });

    it("creates and returns document chunks", async () => {
        const document = await repository.createDocument({
            title: "Return Policy",
            source: "return-policy.md",
            source_type: "markdown",
            mime_type: "text/markdown",
            metadata: {},
        });

        const chunks = await repository.createChunks([
            {
                document_id: document.id,
                chunk_index: 0,
                content: "Customers can return products within 30 days.",
                section: "Returns",
                page_number: 1,
                token_count: 8,
                metadata: {},
            },
            {
                document_id: document.id,
                chunk_index: 1,
                content: "Products must be in their original condition.",
                section: "Conditions",
                page_number: 2,
                token_count: 8,
                metadata: {},
            },
        ]);

        expect(chunks).toHaveLength(2);

        expect(chunks[0].id).toBeDefined();
        expect(chunks[0].document_id).toBe(document.id);
        expect(chunks[0].chunk_index).toBe(0);
        expect(chunks[0].content).toBe(
            "Customers can return products within 30 days.",
        );

        expect(chunks[1].id).toBeDefined();
        expect(chunks[1].document_id).toBe(document.id);
        expect(chunks[1].chunk_index).toBe(1);
        expect(chunks[1].content).toBe(
            "Products must be in their original condition.",
        );
    });

    it("searches chunks by vector similarity", async () => {

        const document = await repository.createDocument({
            title: "Vector Search Test",
            source: "vector-search-test.md",
            source_type: "markdown",
            mime_type: "text/markdown",
            metadata: {},
        });

        const vectorA = Array(1536).fill(0);
        vectorA[0] = 1;

        const vectorB = Array(1536).fill(0);
        vectorB[1] = 1;

        const vectorC = Array(1536).fill(0);
        vectorC[0] = -1;

        const toVector = (vector: number[]) => `[${vector.join(",")}]`;

        await repository.createChunks([
            {
                document_id: document.id,
                chunk_index: 0,
                content: "Most similar chunk.",
                section: null,
                page_number: null,
                token_count: 3,
                embedding: toVector(vectorA),
                metadata: {},
            },
            {
                document_id: document.id,
                chunk_index: 1,
                content: "Second most similar chunk.",
                section: null,
                page_number: null,
                token_count: 4,
                embedding: toVector(vectorB),
                metadata: {},
            },
            {
                document_id: document.id,
                chunk_index: 2,
                content: "Least similar chunk.",
                section: null,
                page_number: null,
                token_count: 3,
                embedding: toVector(vectorC),
                metadata: {},
            },
        ]);

        const results = await repository.searchSimilarChunks(
            vectorA,
            3,
            document.id
        );

        expect(results).toHaveLength(3);

        expect(results[0].chunk_index).toBe(0);
        expect(results[1].chunk_index).toBe(1);
        expect(results[2].chunk_index).toBe(2);

        expect(results[0].distance).toBeCloseTo(0);
        expect(results[1].distance).toBeCloseTo(1);
        expect(results[2].distance).toBeCloseTo(2);
    });
});