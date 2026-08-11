import { AIMessage } from "@langchain/core/messages";
import { SupportState } from "../state.js";

export async function ticketResponseNode(
    state: typeof SupportState.State
) {
    const ticket = state.ticket;

    if (ticket.orderExists === false) {
        return {
            messages: [
                new AIMessage(
                    ticket.message ?? "The order could not be verified."
                ),
            ],
        };
    }

    return {};
}