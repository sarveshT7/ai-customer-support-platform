import { orderService } from "../../../services/order.service.js";
export async function verifyCancellationNode(state) {
    const cancellation = state.cancellation;
    if (!cancellation.requested || !cancellation.orderId) {
        return {};
    }
    const order = await orderService.getOrder(cancellation.orderId);
    if (!order) {
        return {
            cancellation: {
                ...cancellation,
                verified: false,
                canCancel: false,
                message: "Order not found.",
            },
        };
    }
    if (order.status !== "Processing") {
        return {
            cancellation: {
                ...cancellation,
                verified: true,
                canCancel: false,
                message: `Order cannot be cancelled because it is currently ${order.status}.`,
            },
        };
    }
    return {
        cancellation: {
            ...cancellation,
            verified: true,
            canCancel: true,
            message: "Order can be cancelled.",
        },
    };
}
