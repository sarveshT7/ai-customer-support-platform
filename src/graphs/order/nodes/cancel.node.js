import { orderService } from "../../../services/order.service.js";
export async function cancelNode(state) {
    const cancellation = state.cancellation;
    if (!cancellation.requested ||
        !cancellation.orderId ||
        cancellation.approved !== true) {
        return {};
    }
    const result = await orderService.cancelOrder(cancellation.orderId);
    console.log("Cancellation service result:", result);
    return {
        cancellation: {
            ...cancellation,
            success: result.success,
            message: result.message,
        },
    };
}
