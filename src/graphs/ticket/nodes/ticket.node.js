import { HumanMessage } from "@langchain/core/messages";
export async function ticketNode(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (!(lastMessage instanceof HumanMessage)) {
        return {};
    }
    const content = lastMessage.content.toString();
    const orderIdMatch = content.match(/\bORD-\d+\b/i);
    const isTicketRequest = /\b(create|raise|open|report|submit)\b.*\b(ticket|support ticket)\b/i.test(content);
    // New order ID supplied after the initial ticket request
    if (orderIdMatch && state.ticket.requested) {
        return {
            ticket: {
                orderId: orderIdMatch[0].toUpperCase(),
            },
        };
    }
    if (!isTicketRequest) {
        return {};
    }
    return {
        ticket: {
            requested: true,
            ...(orderIdMatch
                ? { orderId: orderIdMatch[0].toUpperCase() }
                : {}),
        },
    };
}
