import { Kysely } from "kysely";
import type { Database, ProductRow } from "../database/index.js";
import { db } from "../database/kysely/db.js";
import type { ProductCategory } from "../models/product.js";

export interface ProductSearchFilters {
    category?: ProductCategory;
    maxPrice?: number;
}

export class ProductRepository {
    constructor(private readonly database: Kysely<Database> = db) { }

    async search(filters: ProductSearchFilters): Promise<ProductRow[]> {
        let query = this.database.selectFrom("products").selectAll();

        if (filters.category) {
            query = query.where("category", "=", filters.category);
        }

        if (filters.maxPrice !== undefined) {
            query = query.where("price", "<=", filters.maxPrice);
        }

        return query.orderBy("product_id", "asc").execute();
    }
}

export const productRepository = new ProductRepository();
