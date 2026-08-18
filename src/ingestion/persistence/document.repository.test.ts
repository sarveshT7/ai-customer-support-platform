import { afterAll, describe, expect, it } from "vitest";
import { closeDb, db } from "../../database/kysely/db.js";
import { DocumentRepository } from "../../repositories/document.repository.js";

describe("DocumentRepository", () => {
    const repository = new DocumentRepository();

    afterAll(async () => {
        await closeDb();
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
});