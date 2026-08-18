import { interrupt } from "@langchain/langgraph";
export async function cancellationApprovalNode(state) {
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
