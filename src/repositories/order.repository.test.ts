import { afterAll, afterEach, describe, expect, it } from "vitest";
import { closeDb, db } from "../database/kysely/db.js";
import { OrderRepository } from "./order.repository.js";

describe("OrderRepository", () => {
    const repository = new OrderRepository();

    afterEach(async () => {
        await db
            .deleteFrom("orders")
            .where("order_id", "like", "ORD-REPO-TEST-%")
            .execute();
    });

    afterAll(async () => {
        await closeDb();
    });

    it("finds an order by id", async () => {
        await db
            .insertInto("orders")
            .values({
                order_id: "ORD-REPO-TEST-1",
                customer: "Test Customer",
                status: "Processing",
                expected_delivery: "Tomorrow",
            })
            .execute();

        const order = await repository.findById("ORD-REPO-TEST-1");

        expect(order?.order_id).toBe("ORD-REPO-TEST-1");
        expect(order?.customer).toBe("Test Customer");
        expect(order?.status).toBe("Processing");
    });

    it("returns null when the order does not exist", async () => {
        const order = await repository.findById("ORD-MISSING");
        expect(order).toBeNull();
    });

    it("updates an order's status and touches updated_at", async () => {
        const inserted = await db
            .insertInto("orders")
            .values({
                order_id: "ORD-REPO-TEST-2",
                customer: "Test Customer",
                status: "Processing",
                expected_delivery: "Tomorrow",
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        const updated = await repository.updateStatus("ORD-REPO-TEST-2", "Cancelled");

        expect(updated.status).toBe("Cancelled");
        expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(
            inserted.updated_at.getTime(),
        );
    });

    it("throws when updating a non-existent order", async () => {
        await expect(
            repository.updateStatus("ORD-MISSING", "Cancelled"),
        ).rejects.toThrow("Order not found");
    });
});
