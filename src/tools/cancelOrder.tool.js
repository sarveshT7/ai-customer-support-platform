import { tool } from "@langchain/core/tools";
import z from "zod";
import { orderService } from "../services/order.service.js";
export const cancelOrderTool = tool(async ({ orderId }) => {
    const result = await orderService.cancelOrder(orderId);
    return result;
}, {
    name: "cancel_order",
    description: "Cancel an existing order. Use this only after the order has been verified and cancellation has been approved.",
    schema: z.object({
        orderId: z
            .string()
            .describe("The unique ID of the order to cancel"),
    }),
});
