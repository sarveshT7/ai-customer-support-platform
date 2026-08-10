import { HumanMessage } from "@langchain/core/messages";
import { SupportState } from "../state.js";


export async function cancellationNode(
    state: typeof SupportState.State
) {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!(lastMessage instanceof HumanMessage)) {
        return {};
    }

    const content = lastMessage.content.toString();

    const orderIdMatch = content.match(/\bORD-\d+\b/i);

    const isCancellationRequest =
        /\b(cancel|cancellation)\b/i.test(content);

    if (!isCancellationRequest || !orderIdMatch) {
        return {};
    }

    return {
        cancellation: {
            requested: true,
            orderId: orderIdMatch[0].toUpperCase(),
        },
    };
}