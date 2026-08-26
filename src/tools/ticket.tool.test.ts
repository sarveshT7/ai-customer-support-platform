import { describe, expect, it, vi } from "vitest";
import { createTicketTool } from "./ticket.tool.js";

const { createTicket } = vi.hoisted(() => ({
    createTicket: vi.fn(),
}));

vi.mock("../services/ticket.service.js", () => ({
    ticketService: { createTicket },
}));

describe("createTicketTool", () => {
    it("returns the ticket created by the ticket service", async () => {
        const ticket = {
            ticketId: "TKT-1",
            issue: "Laptop won't turn on.",
            category: "Technical",
            orderId: "ORD-1001",
            priority: "High",
            status: "Open",
            createdAt: new Date().toISOString(),
        };
        createTicket.mockReset();
        createTicket.mockResolvedValue(ticket);

        const result = await createTicketTool.invoke({
            issue: "Laptop won't turn on.",
            category: "Technical",
            orderId: "ORD-1001",
            priority: "High",
        });

        expect(createTicket).toHaveBeenCalledWith({
            issue: "Laptop won't turn on.",
            category: "Technical",
            orderId: "ORD-1001",
            priority: "High",
        });
        expect(result).toEqual({ success: true, ticket });
    });

    it("retries a transient failure before succeeding", async () => {
        const ticket = {
            ticketId: "TKT-2",
            issue: "Item damaged",
            category: "Damaged Product",
            orderId: "ORD-1002",
            priority: "Medium",
            status: "Open",
            createdAt: new Date().toISOString(),
        };
        createTicket.mockReset();
        createTicket
            .mockRejectedValueOnce(new Error("timeout"))
            .mockResolvedValueOnce(ticket);

        const result = await createTicketTool.invoke({
            issue: "Item damaged",
            category: "Damaged Product",
            orderId: "ORD-1002",
            priority: "Medium",
        });

        expect(createTicket).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ success: true, ticket });
    });

    it("propagates a non-retryable failure without retrying", async () => {
        createTicket.mockReset();
        createTicket.mockRejectedValue(
            new Error(
                'insert or update on table "tickets" violates foreign key constraint',
            ),
        );

        await expect(
            createTicketTool.invoke({
                issue: "Laptop won't turn on.",
                category: "Technical",
                orderId: "ORD-MISSING",
                priority: "High",
            }),
        ).rejects.toThrow();

        expect(createTicket).toHaveBeenCalledTimes(1);
    });
});
