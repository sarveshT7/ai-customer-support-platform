import { describe, expect, it, vi } from "vitest";
import { embeddingService } from "./embedding.service.js";

const { embedQuery, embedDocuments } = vi.hoisted(() => ({
    embedQuery: vi.fn(),
    embedDocuments: vi.fn(),
}));

vi.mock("../llm/embeddings.js", () => ({
    embeddings: {
        embedQuery,
        embedDocuments,
    },
}));

describe("EmbeddingService", () => {
    it("embeds a single text", async () => {
        const vector = [0.1, 0.2, 0.3];

        embedQuery.mockResolvedValue(vector);


        const result = await embeddingService.embedText(
            "Customers can return products within 30 days.",
        );

        expect(embedQuery).toHaveBeenCalledWith(        
            "Customers can return products within 30 days.",
        );

        expect(result).toBe(vector);
    });

    it("embeds multiple texts", async () => {
        const vectors = [
            [0.1, 0.2, 0.3],
            [0.4, 0.5, 0.6],
        ];

        embedDocuments.mockResolvedValue(vectors);

        const result = await embeddingService.embedTexts([
            "Return policy",
            "Refund policy",
        ]);

        expect(embedDocuments).toHaveBeenCalledWith([
            "Return policy",
            "Refund policy",
        ]);

        expect(result).toBe(vectors);
    });
});