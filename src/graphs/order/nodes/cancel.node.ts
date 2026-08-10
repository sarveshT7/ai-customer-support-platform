import { SupportState } from "../state.js";
import { orderService } from "../../../services/order.service.js";

export async function cancelNode(
    state: typeof SupportState.State
) {
    const cancellation = state.cancellation;

    if (
        !cancellation.requested ||
        !cancellation.orderId ||
        cancellation.approved !== true
    ) {
        return {};
    }

    const result = await orderService.cancelOrder(
        cancellation.orderId
    );

    return {
        cancellation: {
            ...cancellation,
            success:result.success,
            message: result.message,
        },
    };
}