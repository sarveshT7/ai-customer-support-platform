import { SupportState } from "../state.js";
import { orderService } from "../../../services/order.service.js";

// Complaints that only make sense once the customer has actually received the product.
const REQUIRES_DELIVERY = /\b(damaged|broken|defective|faulty|warranty)\b/i;

export async function verifyOrderNode(
    state: typeof SupportState.State
) {
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

    const lastMessage = state.messages[state.messages.length - 1];
    const content =
        lastMessage?._getType?.() === "human" ? String(lastMessage.content) : "";

    if (REQUIRES_DELIVERY.test(content) && order.status !== "Delivered") {
        return {
            ticket: {
                ...ticket,
                verified: true,
                orderExists: true,
                eligible: false,
                message: `Order ${ticket.orderId} is currently ${order.status} and hasn't been delivered yet, so a damaged product or warranty claim can't be filed until it arrives.`,
            },
        };
    }

    return {
        ticket: {
            ...ticket,
            verified: true,
            orderExists: true,
            eligible: true,
            message: `Order ${ticket.orderId} was verified.`,
        },
    };
}