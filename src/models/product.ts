export const PRODUCT_CATEGORIES = [
    "Mouse",
    "Keyboard",
    "Accessories",
    "Laptop",
    "Monitor",
    "Audio",
    "Storage",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
    productId: string;
    name: string;
    category: ProductCategory;
    price: number;
    stock: number;
    rating: number;
    brand: string;
}