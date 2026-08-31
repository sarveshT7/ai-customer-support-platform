import { describe, expect, it, vi } from "vitest";
import { getTicketTool } from "./getTicket.tool.js";

const { getTicket } = vi.hoisted(() => ({
    getTicket: vi.fn(),
}));

vi.mock("../services/ticket.service.js", () => ({
    ticketService: { getTicket },
}));

describe("getTicketTool", () => {
    it("returns the ticket found by the ticket service", async () => {
        const ticket = {
            ticketId: "TKT-1",
            issue: "Laptop won't turn on.",
            category: "Technical",
            orderId: "ORD-1001",
            priority: "High",
            status: "Open",
            createdAt: new Date().toISOString(),
        };
        getTicket.mockResolvedValue(ticket);

        const result = await getTicketTool.invoke({ ticketId: "TKT-1" });

        expect(getTicket).toHaveBeenCalledWith("TKT-1");
        expect(result).toEqual(ticket);
    });

    it("returns null when the ticket is not found", async () => {
        getTicket.mockResolvedValue(null);

        const result = await getTicketTool.invoke({ ticketId: "TKT-MISSING" });

        expect(result).toBeNull();
    });
});
