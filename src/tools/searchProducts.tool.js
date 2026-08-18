import { tool } from "@langchain/core/tools";
import z from "zod";
import { products } from "../data/products.js";
export const searchProductsTool = tool(async ({ category, maxPrice }) => {
    const matchingProducts = products.filter((product) => {
        const categoryMatch = !category || product.category === category;
        const priceMatch = maxPrice === undefined || product.price <= maxPrice;
        return categoryMatch && priceMatch;
    });
    console.log("Matching products:", matchingProducts);
    return {
        products: matchingProducts
    };
}, {
    name: "search_products",
    description: "Search for products by category and maximum price.Use this tool whenever a customer asks for product recommendations or wants products within a budget.",
    schema: z.object({
        category: z.enum([
            "Laptop",
            "Mouse",
            "Keyboard",
            "Monitor",
            "Accessories"
        ]).optional().describe("The category of the products to search for"),
        maxPrice: z.number().optional().describe("The maximum price in rupees of the products to search for"),
    })
});
