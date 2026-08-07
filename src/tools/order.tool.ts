import { tool } from "@langchain/core/tools";
import z from "zod";
import { orderService } from "../services/order.service.js";

export const getOrderTool = tool(
    async ({ orderId }: { orderId: string }) => {
        const result = await orderService.getOrder(orderId)
        return result
    },
    {
        name: "get_order",
        description: "Retrieve order details using an order ID.",
        schema: z.object({
            orderId: z.string().describe("The customers order ID"),
        }),
    }
);