import { describe, expect, it } from "vitest";
import { cleanText } from "./text.cleaner.js";

describe("cleanText", () => {
    it("collapses repeated spaces", () => {
        expect(cleanText("Customers    can return products."))
            .toBe("Customers can return products.");
    });

    it("normalizes Windows line endings", () => {
        expect(cleanText("Returns\r\nare allowed."))
            .toBe("Returns\nare allowed.");
    });

    it("removes excessive blank lines", () => {
        expect(cleanText("Returns are allowed.\n\n\n\nRefunds are processed."))
            .toBe("Returns are allowed.\n\nRefunds are processed.");
    });

    it("trims surrounding whitespace", () => {
        expect(cleanText("   Return policy   "))
            .toBe("Return policy");
    });

    it("preserves important information", () => {
        expect(cleanText(
            "Laptops can be returned within 30 days. SKU: LAP-101."
        )).toBe(
            "Laptops can be returned within 30 days. SKU: LAP-101."
        );
    }),
        it("shows cleaning output", () => {
            const input =
                "   Customers    can return products.\r\n\r\n\r\n\r\n" +
                "Returns are allowed within 30 days.   ";

            const output = cleanText(input);

            // console.log("\n--- Cleaner ---");
            // console.log("Before:");
            // console.log(JSON.stringify(input));

            // console.log("After:");
            // console.log(JSON.stringify(output));
            // console.log("---------------\n");

            expect(output).toBe(
                "Customers can return products.\n\nReturns are allowed within 30 days."
            );
        });
});