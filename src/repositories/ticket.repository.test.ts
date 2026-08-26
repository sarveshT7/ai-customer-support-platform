import { afterAll, afterEach, describe, expect, it } from "vitest";
import { closeDb, db } from "../database/kysely/db.js";
import { TicketRepository } from "./ticket.repository.js";

describe("TicketRepository", () => {
    const repository = new TicketRepository();

    afterEach(async () => {
        await db.deleteFrom("tickets").execute();
    });

    afterAll(async () => {
        await closeDb();
    });

    it("creates and returns a ticket", async () => {
        const ticket = await repository.create({
            ticket_id: "TKT-REPO-TEST-1",
            issue: "Laptop won't turn on.",
            category: "Technical",
            order_id: "ORD-1001",
            priority: "High",
            status: "Open",
        });

        expect(ticket.ticket_id).toBe("TKT-REPO-TEST-1");
        expect(ticket.issue).toBe("Laptop won't turn on.");
        expect(ticket.category).toBe("Technical");
        expect(ticket.order_id).toBe("ORD-1001");
        expect(ticket.priority).toBe("High");
        expect(ticket.status).toBe("Open");
        expect(ticket.created_at).toBeInstanceOf(Date);
    });

    it("rejects a ticket referencing an order that does not exist", async () => {
        await expect(
            repository.create({
                ticket_id: "TKT-REPO-TEST-2",
                issue: "Laptop won't turn on.",
                category: "Technical",
                order_id: "ORD-MISSING",
                priority: "High",
                status: "Open",
            }),
        ).rejects.toThrow();
    });

    it("rejects a ticket with an invalid category", async () => {
        await expect(
            repository.create({
                ticket_id: "TKT-REPO-TEST-3",
                issue: "Laptop won't turn on.",
                category: "Vehicle",
                order_id: "ORD-1001",
                priority: "High",
                status: "Open",
            }),
        ).rejects.toThrow();
    });
});
