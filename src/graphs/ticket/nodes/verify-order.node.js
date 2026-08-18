import { orderService } from "../../../services/order.service.js";
export async function verifyOrderNode(state) {
    const ticket = state.ticket;
    if (!ticket.requested || !ticket.orderId) {
        return {};
    }
    const order = await orderService.getOrder(ticket.orderId);
    if (!order) {
        return {
            ticket: {
                ...ticket,
                verified: false,
                orderExists: false,
                message: `Order ${ticket.orderId} was not found.`,
            },
        };
    }
    return {
        ticket: {
            ...ticket,
            verified: true,
            orderExists: true,
            message: `Order ${ticket.orderId} was verified.`,
        },
    };
}
