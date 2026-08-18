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
            overlapTokens: 0,
            countTokens,
        });
        console.log('result 1', JSON.stringify(result, null, 2));

        expect(result).toEqual([
            {
                chunkIndex: 0,
                content: "Customers can return products within 30 days.",
                section: "Return Policy",
                tokenCount: 7
            },
            {
                chunkIndex: 1,
                content: "Damaged products must be reported within 7 days.",
                section: "Return Policy > Damaged Products",
                tokenCount: 8
            },
            {
                chunkIndex: 2,
                content: "Refunds are processed within 5 business days.",
                section: "Return Policy > Refunds",
                tokenCount: 7
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
            overlapTokens: 0,
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

        expect(result[0].tokenCount).toBe(countTokens(result[0].content));
        expect(result[1].tokenCount).toBe(countTokens(result[1].content));
        expect(result[2].tokenCount).toBe(countTokens(result[2].content));
    });
    it("splits an oversized block at max token limit", () => {
        const blocks = [
            {
                kind: "heading" as const,
                level: 1,
                text: "Warranty",
            },
            {
                kind: "paragraph" as const,
                text: "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty",
            },
        ];

        const result = chunkBlocks(blocks, {
            targetTokens: 10,
            maxTokens: 15,
            countTokens,
            overlapTokens: 0,
        });

        console.log("oversized result", JSON.stringify(result, null, 2));

        expect(result).toHaveLength(2);

        expect(result.every((chunk) => {
            return countTokens(chunk.content) <= 15;
        })).toBe(true);

        expect(result.every((chunk) => {
            return chunk.tokenCount === countTokens(chunk.content);
        })).toBe(true);
    });
    it("adds overlap between chunks", () => {
        const blocks = [
            {
                kind: "heading" as const,
                level: 1,
                text: "Return Policy",
            },
            {
                kind: "paragraph" as const,
                text: "One two three four five",
            },
            {
                kind: "paragraph" as const,
                text: "six seven eight nine ten",
            },
            {
                kind: "paragraph" as const,
                text: "eleven twelve thirteen fourteen fifteen",
            },
        ];

        const result = chunkBlocks(blocks, {
            targetTokens: 10,
            maxTokens: 15,
            overlapTokens: 3,
            countTokens,
        });

        console.log(
            "overlap result",
            JSON.stringify(result, null, 2),
        );

        expect(result).toHaveLength(2);

        expect(result[0].content).toBe(
            "One two three four five\n\nsix seven eight nine ten"
        );

        expect(result[1].content).toBe(
            "eight nine ten\n\neleven twelve thirteen fourteen fifteen"
        );

        expect(result[0].tokenCount).toBe(
            countTokens(result[0].content)
        );

        expect(result[1].tokenCount).toBe(
            countTokens(result[1].content)
        );
    });
});