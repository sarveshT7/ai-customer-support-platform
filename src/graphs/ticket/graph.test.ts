import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const { invoke: mockModelInvoke } = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

const { getOrder } = vi.hoisted(() => ({
    getOrder: vi.fn(),
}));

const { createTicket } = vi.hoisted(() => ({
    createTicket: vi.fn(),
}));

vi.mock("../../llm/model.js", () => ({
    model: { bindTools: () => ({ invoke: mockModelInvoke }) },
}));

vi.mock("../../services/order.service.js", () => ({
    orderService: { getOrder },
}));

vi.mock("../../services/ticket.service.js", () => ({
    ticketService: { createTicket },
}));

import { ticketGraph } from "./graph.js";

function config(threadId: string) {
    return { configurable: { thread_id: threadId } };
}

describe("ticketGraph", () => {
    beforeEach(() => {
        mockModelInvoke.mockReset();
        getOrder.mockReset();
        createTicket.mockReset();
    });

    it("rejects a damaged-product ticket for an order that hasn't been delivered, without calling the LLM", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1001",
            customer: "Sarvesh",
            status: "Processing",
            expectedDelivery: "Tomorrow",
        });

        const result = await ticketGraph.invoke(
            {
                messages: [
                    new HumanMessage(
                        "Please raise a ticket, my order ORD-1001 arrived damaged."
                    ),
                ],
            },
            config("ticket-ineligible")
        );

        expect(mockModelInvoke).not.toHaveBeenCalled();
        expect(createTicket).not.toHaveBeenCalled();
        const lastMessage = result.messages.at(-1);
        expect(String(lastMessage?.content)).toContain("hasn't been delivered yet");
    });

    it("rejects a ticket for an order that doesn't exist, without calling the LLM", async () => {
        getOrder.mockResolvedValue(null);

        const result = await ticketGraph.invoke(
            {
                messages: [
                    new HumanMessage(
                        "Please raise a ticket for order ORD-9999, it's broken."
                    ),
                ],
            },
            config("ticket-not-found")
        );

        expect(mockModelInvoke).not.toHaveBeenCalled();
        expect(createTicket).not.toHaveBeenCalled();
        const lastMessage = result.messages.at(-1);
        expect(String(lastMessage?.content)).toContain("was not found");
    });

    it("creates a ticket for a damaged-product claim once the order has been delivered", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1002",
            customer: "John",
            status: "Delivered",
            expectedDelivery: "Yesterday",
        });

        const createdTicket = {
            ticketId: "TKT-1",
            issue: "Laptop arrived broken.",
            category: "Damaged Product",
            orderId: "ORD-1002",
            priority: "High",
            status: "Open",
            createdAt: new Date().toISOString(),
        };
        createTicket.mockResolvedValue(createdTicket);

        mockModelInvoke
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "",
                    tool_calls: [
                        {
                            name: "create_ticket",
                            args: {
                                issue: "Laptop arrived broken.",
                                category: "Damaged Product",
                                orderId: "ORD-1002",
                                priority: "High",
                            },
                            id: "call_1",
                            type: "tool_call",
                        },
                    ],
                })
            )
            .mockResolvedValueOnce(
                new AIMessage({
                    content: `Ticket ${createdTicket.ticketId} has been created.`,
                    tool_calls: [],
                })
            );

        const result = await ticketGraph.invoke(
            {
                messages: [
                    new HumanMessage(
                        "Please raise a ticket for my broken laptop, order ORD-1002."
                    ),
                ],
            },
            config("ticket-eligible")
        );

        expect(createTicket).toHaveBeenCalledWith({
            issue: "Laptop arrived broken.",
            category: "Damaged Product",
            orderId: "ORD-1002",
            priority: "High",
        });
        const lastMessage = result.messages.at(-1);
        expect(lastMessage?.content).toBe("Ticket TKT-1 has been created.");
    });

    it("reports a failure message when ticket creation fails non-retryably", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1002",
            customer: "John",
            status: "Delivered",
            expectedDelivery: "Yesterday",
        });

        createTicket.mockRejectedValue(
            new Error(
                'insert or update on table "tickets" violates foreign key constraint'
            )
        );

        mockModelInvoke.mockResolvedValueOnce(
            new AIMessage({
                content: "",
                tool_calls: [
                    {
                        name: "create_ticket",
                        args: {
                            issue: "Laptop arrived broken.",
                            category: "Damaged Product",
                            orderId: "ORD-1002",
                            priority: "High",
                        },
                        id: "call_1",
                        type: "tool_call",
                    },
                ],
            })
        );

        const result = await ticketGraph.invoke(
            {
                messages: [
                    new HumanMessage(
                        "Please raise a ticket for my broken laptop, order ORD-1002."
                    ),
                ],
            },
            config("ticket-creation-failed")
        );

        expect(createTicket).toHaveBeenCalledTimes(1);
        const lastMessage = result.messages.at(-1);
        expect(String(lastMessage?.content)).toContain(
            "couldn't create the support ticket"
        );
    });
});
