import { afterAll, describe, expect, it } from "vitest";
import { DocumentRepository } from "./document.repository.js";
import { closeDb } from "../../database/kysely/db.js";

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
});