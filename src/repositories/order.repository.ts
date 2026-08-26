import { Kysely } from "kysely";
import type { Database, OrderRow } from "../database/index.js";
import { db } from "../database/kysely/db.js";
import type { OrderStatus } from "../models/order.js";

export class OrderRepository {
    constructor(private readonly database: Kysely<Database> = db) { }

    async findById(orderId: string): Promise<OrderRow | null> {
        const order = await this.database
            .selectFrom("orders")
            .selectAll()
            .where("order_id", "=", orderId)
            .executeTakeFirst();

        return order ?? null;
    }

    async updateStatus(orderId: string, status: OrderStatus): Promise<OrderRow> {
        const order = await this.database
            .updateTable("orders")
            .set({ status, updated_at: new Date() })
            .where("order_id", "=", orderId)
            .returningAll()
            .executeTakeFirst();

        if (!order) {
            throw new Error("Order not found");
        }

        return order;
    }
}

export const orderRepository = new OrderRepository();
