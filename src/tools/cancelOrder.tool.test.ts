import { describe, expect, it, vi } from "vitest";
import { cancelOrderTool } from "./cancelOrder.tool.js";

const { cancelOrder } = vi.hoisted(() => ({
    cancelOrder: vi.fn(),
}));

vi.mock("../services/order.service.js", () => ({
    orderService: { cancelOrder },
}));

describe("cancelOrderTool", () => {
    it("returns the cancellation result from the order service", async () => {
        const cancellationResult = {
            success: true,
            message: "Order cancelled successfully",
            order: {
                orderId: "ORD-1001",
                customer: "Sarvesh",
                status: "Cancelled",
                expectedDelivery: "Tomorrow",
            },
        };
        cancelOrder.mockResolvedValue(cancellationResult);

        const result = await cancelOrderTool.invoke({ orderId: "ORD-1001" });

        expect(cancelOrder).toHaveBeenCalledWith("ORD-1001");
        expect(result).toEqual(cancellationResult);
    });

    it("returns a failure result when the order cannot be cancelled", async () => {
        const cancellationResult = {
            success: false,
            message: "Only processing orders can be cancelled.",
        };
        cancelOrder.mockResolvedValue(cancellationResult);

        const result = await cancelOrderTool.invoke({ orderId: "ORD-1002" });

        expect(result).toEqual(cancellationResult);
    });
});
