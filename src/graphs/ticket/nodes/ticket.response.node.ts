import { AIMessage } from "@langchain/core/messages";
import { SupportState } from "../state.js";

export async function ticketResponseNode(
    state: typeof SupportState.State
) {
    const ticket = state.ticket;

    // Order verification failed, or the order isn't eligible for this kind of ticket yet
    if ((ticket.orderExists === false || ticket.eligible === false) && ticket.requested) {
        return {
            messages: [
                new AIMessage(
                    ticket.message ?? "The order could not be verified."
                ),
            ],
            ticket: {
                requested: false,
                orderId: undefined,
                verified: false,
                orderExists: undefined,
                eligible: undefined,
                message: undefined,
            },
        };
    }

    // Ticket creation failed
    if (ticket.created === false && ticket.requested) {
        return {
            messages: [
                new AIMessage(
                    "I couldn't create the support ticket because the ticket service timed out. Please try again."
                ),
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