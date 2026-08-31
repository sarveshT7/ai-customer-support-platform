import { afterAll, afterEach, describe, expect, it } from "vitest";
import { documentService } from "./document.service.js";
import { closeDb, db } from "../database/kysely/db.js";

describe("DocumentService", () => {
    afterEach(async () => {
        await db
            .deleteFrom("documents")
            .where("source", "like", "%service-test-%")
            .execute();
    });

    afterAll(async () => {
        await closeDb();
    });

    it("persists a document and its chunks atomically", async () => {
        const source = `service-test-${Date.now()}.md`;

        const result = await documentService.persistDocument({
            document: {
                title: "Return Policy",
                source,
                source_type: "markdown",
                mime_type: "text/markdown",
                metadata: {},
            },
            chunks: [
                {
                    chunk_index: 0,
                    content: "Customers can return products within 30 days.",
                    section: "Returns",
                    page_number: 1,
                    token_count: 8,
                    metadata: {},
                },
                {
                    chunk_index: 1,
                    content: "Products must be in their original condition.",
                    section: "Conditions",
                    page_number: 2,
                    token_count: 8,
                    metadata: {},
                },
            ],
        });

        expect(result.document.id).toBeDefined();
        expect(result.document.source).toBe(source);

        expect(result.chunks).toHaveLength(2);

        expect(result.chunks[0].document_id).toBe(result.document.id);
        expect(result.chunks[1].document_id).toBe(result.document.id);

        const storedChunks = await db
            .selectFrom("document_chunks")
            .selectAll()
            .where("document_id", "=", result.document.id)
            .execute();

        expect(storedChunks).toHaveLength(2);
    });
    it("rolls back the document when chunk persistence fails", async () => {
        const source = `rollback-service-test-${Date.now()}.md`;

        await expect(
            documentService.persistDocument({
                document: {
                    title: "Rollback Test",
                    source,
                    source_type: "markdown",
                    mime_type: "text/markdown",
                    metadata: {},
                },
                chunks: [
                    {
                        chunk_index: 0,
                        content: "Valid chunk",
                        metadata: {},
                    },
                    {
                        chunk_index: "invalid" as unknown as number,
                        content: "This should fail",
                        metadata: {},
                    },
                ],
            }),
        ).rejects.toThrow();

        const documents = await db
            .selectFrom("documents")
            .selectAll()
            .where("source", "=", source)
            .execute();

        expect(documents).toHaveLength(0);
    });

    it("replaces the prior document and chunks when the same source is re-ingested", async () => {
        const source = `dedup-service-test-${Date.now()}.md`;

        const first = await documentService.persistDocument({
            document: {
                title: "Original Title",
                source,
                source_type: "markdown",
                mime_type: "text/markdown",
                metadata: {},
            },
            chunks: [
                {
                    chunk_index: 0,
                    content: "Original content.",
                    metadata: {},
                },
            ],
        });

        const second = await documentService.persistDocument({
            document: {
                title: "Updated Title",
                source,
                source_type: "markdown",
                mime_type: "text/markdown",
                metadata: {},
            },
            chunks: [
                {
                    chunk_index: 0,
                    content: "Updated content, first chunk.",
                    metadata: {},
                },
                {
                    chunk_index: 1,
                    content: "Updated content, second chunk.",
                    metadata: {},
                },
            ],
        });

        const documents = await db
            .selectFrom("documents")
            .selectAll()
            .where("source", "=", source)
            .execute();
        expect(documents).toHaveLength(1);
        expect(documents[0].id).toBe(second.document.id);
        expect(documents[0].title).toBe("Updated Title");

        const oldChunks = await db
            .selectFrom("document_chunks")
            .selectAll()
            .where("document_id", "=", first.document.id)
            .execute();
        expect(oldChunks).toHaveLength(0);

        const newChunks = await db
            .selectFrom("document_chunks")
            .selectAll()
            .where("document_id", "=", second.document.id)
            .execute();
        expect(newChunks).toHaveLength(2);
    });
});