import { afterAll, describe, expect, it } from "vitest";
import { closeDb } from "../database/kysely/db.js";
import { ProductService } from "./product.service.js";

describe("ProductService", () => {
    const service = new ProductService();

    afterAll(async () => {
        await closeDb();
    });

    it("returns products mapped to the domain shape for a matching category", async () => {
        const products = await service.searchProducts({ category: "Mouse" });

        expect(products.length).toBeGreaterThan(0);
        products.forEach((product) => {
            expect(product.category).toBe("Mouse");
            expect(product).toEqual(
                expect.objectContaining({
                    productId: expect.any(String),
                    name: expect.any(String),
                    brand: expect.any(String),
                    price: expect.any(Number),
                    stock: expect.any(Number),
                    rating: expect.any(Number),
                }),
            );
            expect(product).not.toHaveProperty("product_id");
        });
    });

    it("returns an empty array when nothing matches", async () => {
        const products = await service.searchProducts({
            category: "Laptop",
            maxPrice: 1,
        });

        expect(products).toEqual([]);
    });
});
