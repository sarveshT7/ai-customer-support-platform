import { parseMarkdown } from "./markdown.parser.js";
import { describe, expect, it } from "vitest";
describe("parseMarkdown", () => {
    it("parses headings and paragraphs", () => {
        const markdown = `
# Return Policy

Customers can return products within 30 days.

## Damaged Products

Damaged products must be reported within 7 days.

## Refunds

Refunds are processed within 5 business days.
`;
        const result = parseMarkdown(markdown);
        expect(result.title).toBe("Return Policy");
        expect(result.blocks).toEqual([
            {
                kind: "heading",
                level: 1,
                text: "Return Policy",
            },
            {
                kind: "paragraph",
                text: "Customers can return products within 30 days.",
            },
            {
                kind: "heading",
                level: 2,
                text: "Damaged Products",
            },
            {
                kind: "paragraph",
                text: "Damaged products must be reported within 7 days.",
            },
            {
                kind: "heading",
                level: 2,
                text: "Refunds",
            },
            {
                kind: "paragraph",
                text: "Refunds are processed within 5 business days.",
            },
        ]);
    }),
        it("combines multiple lines into one paragraph", () => {
            const markdown = `
  # Warranty
  
  TechStore provides a two-year warranty
  for manufacturing defects. 
  `;
            const result = parseMarkdown(markdown);
            expect(result.blocks).toEqual([
                {
                    kind: "heading",
                    level: 1,
                    text: "Warranty",
                },
                {
                    kind: "paragraph",
                    text: "TechStore provides a two-year warranty for manufacturing defects.",
                },
            ]);
        });
});
