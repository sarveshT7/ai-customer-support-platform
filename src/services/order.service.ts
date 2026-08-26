import type { OrderRow } from "../database/index.js";
import { OrderRepository, orderRepository } from "../repositories/order.repository.js";
import type { Order, OrderStatus } from "../models/order.js";

function toOrder(row: OrderRow): Order {
    return {
        orderId: row.order_id,
        customer: row.customer,
        status: row.status as OrderStatus,
        expectedDelivery: row.expected_delivery,
    };
}

export class OrderService {
    constructor(private readonly repository: OrderRepository = orderRepository) { }

    async getOrder(orderId: string): Promise<Order | null> {
        const row = await this.repository.findById(orderId);
        return row ? toOrder(row) : null;
    }

    async cancelOrder(orderId: string) {
        const row = await this.repository.findById(orderId);
        if (!row) {
            return {
                success: false,
                message: "Order not found",
            };
        }

        if (row.status !== "Processing") {
            return {
                success: false,
                message: "Only processing orders can be cancelled.",
            };
        }

        const updatedRow = await this.repository.updateStatus(orderId, "Cancelled");
        return {
            success: true,
            message: "Order cancelled successfully",
            order: toOrder(updatedRow),
        };
    }
}

export const orderService = new OrderService();
