import { closeDb, db } from "./kysely/db.js";
import { products } from "../data/products.js";
import { orders } from "../data/orders.js";

// Idempotent: safe to run repeatedly. Existing rows (matched by primary key) are updated to
// match src/data/*.ts; new entries added to those files are inserted. This is separate from
// the migrations so editing the seed data doesn't require a new migration every time.

async function seedProducts(): Promise<void> {
    if (products.length === 0) {
        return;
    }

    await db
        .insertInto("products")
        .values(
            products.map((product) => ({
                product_id: product.productId,
                name: product.name,
                category: product.category,
                brand: product.brand,
                price: product.price,
                stock: product.stock,
                rating: product.rating,
            })),
        )
        .onConflict((oc) =>
            oc.column("product_id").doUpdateSet({
                name: (eb) => eb.ref("excluded.name"),
                category: (eb) => eb.ref("excluded.category"),
                brand: (eb) => eb.ref("excluded.brand"),
                price: (eb) => eb.ref("excluded.price"),
                stock: (eb) => eb.ref("excluded.stock"),
                rating: (eb) => eb.ref("excluded.rating"),
                updated_at: new Date(),
            }),
        )
        .execute();

    console.log(`Seeded ${products.length} products.`);
}

async function seedOrders(): Promise<void> {
    if (orders.length === 0) {
        return;
    }

    await db
        .insertInto("orders")
        .values(
            orders.map((order) => ({
                order_id: order.orderId,
                customer: order.customer,
                status: order.status,
                expected_delivery: order.expectedDelivery,
            })),
        )
        .onConflict((oc) =>
            oc.column("order_id").doUpdateSet({
                customer: (eb) => eb.ref("excluded.customer"),
                status: (eb) => eb.ref("excluded.status"),
                expected_delivery: (eb) => eb.ref("excluded.expected_delivery"),
                updated_at: new Date(),
            }),
        )
        .execute();

    console.log(`Seeded ${orders.length} orders.`);
}

async function seed(): Promise<void> {
    try {
        await seedProducts();
        await seedOrders();
    } catch (error) {
        console.error("failed to seed", error);
        await closeDb();
        process.exit(1);
    }

    await closeDb();
}

seed();
