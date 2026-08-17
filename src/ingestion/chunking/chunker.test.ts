import { describe, expect, it } from "vitest";
import { chunkBlocks } from "./chunker.js";

describe("chunkBlocks", () => {
    it("creates section-aware chunks", () => {
        const blocks = [
            {
                kind: "heading" as const,
                level: 1,
                text: "Return Policy",
            },
            {
                kind: "paragraph" as const,
                text: "Customers can return products within 30 days.",
            },
            {
                kind: "heading" as const,
                level: 2,
                text: "Damaged Products",
            },
            {
                kind: "paragraph" as const,
                text: "Damaged products must be reported within 7 days.",
            },
            {
                kind: "heading" as const,
                level: 2,
                text: "Refunds",
            },
            {
                kind: "paragraph" as const,
                text: "Refunds are processed within 5 business days.",
            },
        ];

        const result = chunkBlocks(blocks);

        console.log(JSON.stringify(result, null, 2));

        expect(result).toEqual([
            {
                chunkIndex: 0,
                content: "Customers can return products within 30 days.",
                section: "Return Policy",
            },
            {
                chunkIndex: 1,
                content: "Damaged products must be reported within 7 days.",
                section: "Return Policy > Damaged Products",
            },
            {
                chunkIndex: 2,
                content: "Refunds are processed within 5 business days.",
                section: "Return Policy > Refunds",
            },
        ]);
    });
});