export interface Product {
    productId: string;
    name: string;
    category: ProductCategory;
    price: number;
    stock: number;
    rating: number;
    brand: string;
}

export type ProductCategory = "Mouse" | "Keyboard" | "Accessories" | "Laptop" | "Desktop";