import { tool } from "@langchain/core/tools";
import z from "zod";
import { PRODUCT_CATEGORIES, ProductCategory } from "../models/product.js";
import { productService } from "../services/product.service.js";


export const searchProductsTool = tool(
    async ({ category, maxPrice }: { category?: ProductCategory, maxPrice?: number }) => {
        const products = await productService.searchProducts({ category, maxPrice });

        return {
            products
        }
    },
    {
        name: "search_products",
        description: "Search for products by category and maximum price.Use this tool whenever a customer asks for product recommendations or wants products within a budget.",
        schema: z.object({
            category: z.enum(PRODUCT_CATEGORIES).optional().describe("The category of the products to search for"),
            maxPrice: z.number().optional().describe("The maximum price in rupees of the products to search for"),
        })
    }
)
