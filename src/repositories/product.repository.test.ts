import { afterAll, describe, expect, it } from "vitest";
import { closeDb } from "../database/kysely/db.js";
import { ProductRepository } from "./product.repository.js";

describe("ProductRepository", () => {
    const repository = new ProductRepository();

    afterAll(async () => {
        await closeDb();
    });

    it("returns products matching a category", async () => {
        const results = await repository.search({ category: "Laptop" });

        expect(results.length).toBeGreaterThan(0);
        results.forEach((product) => {
            expect(product.category).toBe("Laptop");
        });
    });

    it("returns products at or under the given max price", async () => {
        const results = await repository.search({ maxPrice: 2000 });

        expect(results.length).toBeGreaterThan(0);
        results.forEach((product) => {
            expect(product.price).toBeLessThanOrEqual(2000);
        });
    });

    it("returns products matching both category and max price", async () => {
        const results = await repository.search({
            category: "Accessories",
            maxPrice: 1500,
        });

        expect(results.length).toBeGreaterThan(0);
        results.forEach((product) => {
            expect(product.category).toBe("Accessories");
            expect(product.price).toBeLessThanOrEqual(1500);
        });
    });

    it("returns no results when no product matches the filters", async () => {
        const results = await repository.search({
            category: "Laptop",
            maxPrice: 1,
        });

        expect(results).toEqual([]);
    });

    it("returns all products when no filters are provided", async () => {
        const results = await repository.search({});

        expect(results.length).toBeGreaterThan(0);
    });
});
