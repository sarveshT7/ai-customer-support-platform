import { interrupt } from "@langchain/langgraph";

import { SupportState } from "../state.js";

export async function cancellationApprovalNode(
    state: typeof SupportState.State
) {
    const cancellation = state.cancellation;

    if (!cancellation.requested || !cancellation.orderId) {
        return {};
    }

    const approval = interrupt({
        type: "cancel_order",
        orderId: cancellation.orderId,
        message: `Approve cancellation of order ${cancellation.orderId}?`,
    });

    return {
        cancellation: {
            ...cancellation,
            approved: approval?.toString().toLowerCase() === "y",
        },
    };
}