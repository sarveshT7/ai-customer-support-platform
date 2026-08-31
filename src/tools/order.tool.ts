import { tool } from "@langchain/core/tools";
import z from "zod";
import { orderService } from "../services/order.service.js";
import { withRetry } from "../lib/retry.js";

export const getOrderTool = tool(
    async ({ orderId }: { orderId: string }) => {
        return withRetry(() => orderService.getOrder(orderId));
    },
    {
        name: "get_order",
        description: "Retrieve order details using an order ID.",
        schema: z.object({
            orderId: z.string().describe("The customers order ID"),
        }),
    }
);