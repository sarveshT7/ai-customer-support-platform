import { HumanMessage } from "@langchain/core/messages";
import { SupportState } from "../state.js";

export async function ticketNode(
    state: typeof SupportState.State
) {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!(lastMessage instanceof HumanMessage)) {
        return {};
    }

    const content = lastMessage.content.toString();

    const orderIdMatch = content.match(/\bORD-\d+\b/i);

    const isTicketRequest =
        /\b(ticket|support ticket|create.*ticket)\b/i.test(content);

    if (!isTicketRequest) {
        return {};
    }

    return {
        ticket: {
            requested: true,
            orderId: orderIdMatch?.[0].toUpperCase(),
        },
    };
}