import { describe, expect, it } from "vitest";
import { embeddings } from "./embeddings.js";

describe("OpenRouter embeddings", () => {
    it("generates an embedding vector", async () => {
        const result = await embeddings.embedQuery(
            "Customers can return products within 30 days.",
        );

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((value) => typeof value === "number")).toBe(true);

        console.log("Embedding dimensions:", result.length);
    }, 15_000);
});