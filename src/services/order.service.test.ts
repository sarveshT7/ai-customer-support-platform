import { afterAll, afterEach, describe, expect, it } from "vitest";
import { closeDb, db } from "../database/kysely/db.js";
import { OrderService } from "./order.service.js";

describe("OrderService", () => {
    const service = new OrderService();

    afterEach(async () => {
        await db
            .deleteFrom("orders")
            .where("order_id", "like", "ORD-SVC-TEST-%")
            .execute();
    });

    afterAll(async () => {
        await closeDb();
    });

    it("returns a mapped order for an existing id", async () => {
        await db
            .insertInto("orders")
            .values({
                order_id: "ORD-SVC-TEST-1",
                customer: "Test Customer",
                status: "Processing",
                expected_delivery: "Tomorrow",
            })
            .execute();

        const order = await service.getOrder("ORD-SVC-TEST-1");

        expect(order).toEqual({
            orderId: "ORD-SVC-TEST-1",
            customer: "Test Customer",
            status: "Processing",
            expectedDelivery: "Tomorrow",
        });
    });

    it("returns null for an order that does not exist", async () => {
        const order = await service.getOrder("ORD-MISSING");
        expect(order).toBeNull();
    });

    it("cancels a processing order", async () => {
        await db
            .insertInto("orders")
            .values({
                order_id: "ORD-SVC-TEST-3",
                customer: "Test Customer",
                status: "Processing",
                expected_delivery: "Tomorrow",
            })
            .execute();

        const result = await service.cancelOrder("ORD-SVC-TEST-3");

        expect(result).toEqual({
            success: true,
            message: "Order cancelled successfully",
            order: {
                orderId: "ORD-SVC-TEST-3",
                customer: "Test Customer",
                status: "Cancelled",
                expectedDelivery: "Tomorrow",
            },
        });
    });

    it("refuses to cancel an order that is not processing", async () => {
        await db
            .insertInto("orders")
            .values({
                order_id: "ORD-SVC-TEST-4",
                customer: "Test Customer",
                status: "Delivered",
                expected_delivery: "Yesterday",
            })
            .execute();

        const result = await service.cancelOrder("ORD-SVC-TEST-4");

        expect(result).toEqual({
            success: false,
            message: "Only processing orders can be cancelled.",
        });
    });

    it("reports failure when cancelling a non-existent order", async () => {
        const result = await service.cancelOrder("ORD-MISSING");

        expect(result).toEqual({
            success: false,
            message: "Order not found",
        });
    });
});
