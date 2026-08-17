import { describe, expect, it } from "vitest";
import { chunkBlocks } from "./chunker.js";

const countTokens = (text: string) =>
    text.trim().split(/\s+/).length;

const sectionBlocks = [
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

describe("chunkBlocks", () => {
    it("preserves section hierarchy", () => {
        const result = chunkBlocks(sectionBlocks, {
            targetTokens: 100,
            maxTokens: 100,
            countTokens,
        });
        console.log('result 1', JSON.stringify(result, null, 2));

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

    it("splits chunks based on token target", () => {
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
                kind: "paragraph" as const,
                text: "Products must be unused and in original packaging.",
            },
            {
                kind: "paragraph" as const,
                text: "Refunds are processed within 5 business days.",
            },
        ];

        const result = chunkBlocks(blocks, {
            targetTokens: 10,
            maxTokens: 15,
            countTokens,
        });
        console.log('result 2', JSON.stringify(result, null, 2));

        expect(result).toHaveLength(3);

        expect(result[0].content).toBe(
            "Customers can return products within 30 days."
        );

        expect(result[1].content).toBe(
            "Products must be unused and in original packaging."
        );

        expect(result[2].content).toBe(
            "Refunds are processed within 5 business days."
        );

        expect(result.every((chunk) => chunk.section === "Return Policy")).toBe(
            true
        );
    });
});