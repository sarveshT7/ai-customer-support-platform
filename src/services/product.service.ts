import type { ProductRow } from "../database/index.js";
import {
    ProductRepository,
    productRepository,
    type ProductSearchFilters,
} from "../repositories/product.repository.js";
import type { Product, ProductCategory } from "../models/product.js";

function toProduct(row: ProductRow): Product {
    return {
        productId: row.product_id,
        name: row.name,
        category: row.category as ProductCategory,
        price: row.price,
        stock: row.stock,
        rating: row.rating,
        brand: row.brand,
    };
}

export class ProductService {
    constructor(private readonly repository: ProductRepository = productRepository) { }

    async searchProducts(filters: ProductSearchFilters): Promise<Product[]> {
        const rows = await this.repository.search(filters);
        return rows.map(toProduct);
    }
}

export const productService = new ProductService();
