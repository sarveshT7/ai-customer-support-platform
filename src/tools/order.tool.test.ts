import { describe, expect, it, vi } from "vitest";
import { getOrderTool } from "./order.tool.js";

const { getOrder } = vi.hoisted(() => ({
    getOrder: vi.fn(),
}));

vi.mock("../services/order.service.js", () => ({
    orderService: { getOrder },
}));

describe("getOrderTool", () => {
    it("returns the order found by the order service", async () => {
        const order = {
            orderId: "ORD-1001",
            customer: "Sarvesh",
            status: "Processing",
            expectedDelivery: "Tomorrow",
        };
        getOrder.mockResolvedValue(order);

        const result = await getOrderTool.invoke({ orderId: "ORD-1001" });

        expect(getOrder).toHaveBeenCalledWith("ORD-1001");
        expect(result).toEqual(order);
    });

    it("returns null when the order is not found", async () => {
        getOrder.mockResolvedValue(null);

        const result = await getOrderTool.invoke({ orderId: "ORD-MISSING" });

        expect(result).toBeNull();
    });
});
