import { tool } from "@langchain/core/tools";
import z from "zod";
import { orderService } from "../services/order.service.js";
import { withRetry } from "../lib/retry.js";


export const cancelOrderTool = tool(
    async ({ orderId }: { orderId: string }) => {
        return withRetry(() => orderService.cancelOrder(orderId));
    },
    {
        name: "cancel_order",
        description:
            "Cancel an existing order. Use this only after the order has been verified and cancellation has been approved.",
        schema: z.object({
            orderId: z
                .string()
                .describe("The unique ID of the order to cancel"),
        }),
    }
)