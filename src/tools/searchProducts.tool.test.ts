import { describe, expect, it, vi } from "vitest";
import { searchProductsTool } from "./searchProducts.tool.js";
import type { ProductCategory } from "../models/product.js";

const { searchProducts } = vi.hoisted(() => ({
    searchProducts: vi.fn(),
}));

vi.mock("../services/product.service.js", () => ({
    productService: { searchProducts },
}));

describe("searchProductsTool", () => {
    it("returns the products found by the product service", async () => {
        const products = [
            {
                productId: "P-101",
                name: "Logitech G102",
                category: "Mouse",
                price: 1499,
                stock: 25,
                rating: 4.6,
                brand: "Logitech",
            },
        ];
        searchProducts.mockResolvedValue(products);

        const result = await searchProductsTool.invoke({ category: "Mouse" });

        expect(searchProducts).toHaveBeenCalledWith({
            category: "Mouse",
            maxPrice: undefined,
        });
        expect(result).toEqual({ products });
    });

    it("returns an empty products list when the service finds no matches", async () => {
        searchProducts.mockResolvedValue([]);

        const result = await searchProductsTool.invoke({
            category: "Laptop",
            maxPrice: 1,
        });

        expect(result).toEqual({ products: [] });
    });

    it("rejects an invalid category before calling the service", async () => {
        searchProducts.mockClear();

        const invalidInput = {
            category: "Vehicle" as unknown as ProductCategory,
        };

        await expect(
            searchProductsTool.invoke(invalidInput),
        ).rejects.toThrow();

        expect(searchProducts).not.toHaveBeenCalled();
    });
});
