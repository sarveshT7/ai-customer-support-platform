import { afterAll, afterEach, describe, expect, it } from "vitest";
import { closeDb, db } from "../database/kysely/db.js";
import { TicketService } from "./ticket.service.js";

describe("TicketService", () => {
    const service = new TicketService();

    afterEach(async () => {
        await db.deleteFrom("tickets").execute();
    });

    afterAll(async () => {
        await closeDb();
    });

    it("creates a ticket and returns the domain shape", async () => {
        const ticket = await service.createTicket({
            issue: "Laptop won't turn on.",
            category: "Technical",
            orderId: "ORD-1001",
            priority: "High",
        });

        expect(ticket.ticketId).toMatch(/^TKT-/);
        expect(ticket.issue).toBe("Laptop won't turn on.");
        expect(ticket.category).toBe("Technical");
        expect(ticket.orderId).toBe("ORD-1001");
        expect(ticket.priority).toBe("High");
        expect(ticket.status).toBe("Open");
        expect(new Date(ticket.createdAt).toString()).not.toBe("Invalid Date");
    });

    it("rejects creating a ticket for a non-existent order", async () => {
        await expect(
            service.createTicket({
                issue: "Laptop won't turn on.",
                category: "Technical",
                orderId: "ORD-MISSING",
                priority: "High",
            }),
        ).rejects.toThrow();
    });
});
