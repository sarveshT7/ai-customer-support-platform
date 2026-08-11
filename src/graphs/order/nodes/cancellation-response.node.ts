import { AIMessage } from "@langchain/core/messages";
import { SupportState } from "../state.js";

export async function cancellationResponseNode(
    state: typeof SupportState.State
) {
    const cancellation = state.cancellation;

    if (!cancellation.message) {
        return {};
    }

    return {
        messages: [
            new AIMessage(cancellation.message),
        ],
    };
}
