import { orderRepository } from "../repositories/order.repository.js";


export class OrderService {

    async getOrder(orderId: string) {
        return await orderRepository.findById(orderId)
    }

    async cancelOrder(orderId: string) {
        const order = await orderRepository.findById(orderId);
        if (!order) {
            return {
                success: false,
                message: "Order not found",
            };
        }

        if (order.status !== "Processing") {
            return {
                success: false,
                message: "Only processing orders can be cancelled.",
            };
        }
       const updatedOrder= await orderRepository.updateStatus(orderId, "Cancelled");
        return {
            success: true,
            message: "Order cancelled successfully",
            order: updatedOrder,
        }
    }
}

export const orderService = new OrderService()