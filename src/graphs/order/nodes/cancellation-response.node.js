import { AIMessage } from "@langchain/core/messages";
export async function cancellationResponseNode(state) {
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
