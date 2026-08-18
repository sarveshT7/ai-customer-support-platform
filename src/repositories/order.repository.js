import { orders } from "../data/orders.js";
export class OrderRepository {
    async findById(id) {
        const order = orders.find((order) => order.id === id) ?? null;
        return order;
    }
    async updateStatus(id, status) {
        const order = orders.find((order) => order.id === id) ?? null;
        if (!order) {
            throw new Error("Order not found");
        }
        order.status = status;
        return order;
    }
}
export const orderRepository = new OrderRepository();
