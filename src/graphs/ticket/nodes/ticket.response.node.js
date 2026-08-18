import { AIMessage } from "@langchain/core/messages";
export async function ticketResponseNode(state) {
    const ticket = state.ticket;
    // Order verification failed
    if (ticket.orderExists === false && ticket.requested) {
        return {
            messages: [
                new AIMessage(ticket.message ?? "The order could not be verified."),
            ],
            ticket: {
                requested: false,
                orderId: undefined,
                verified: false,
                orderExists: undefined,
                message: undefined,
            },
        };
    }
    // Ticket creation failed
    if (ticket.created === false && ticket.requested) {
        return {
            messages: [
                new AIMessage("I couldn't create the support ticket because the ticket service timed out. Please try again."),
            ],
            ticket: {
                requested: false,
                created: false,
                message: undefined,
            },
        };
    }
    return {};
}
