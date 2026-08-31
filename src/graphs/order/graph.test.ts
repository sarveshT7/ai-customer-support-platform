import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";

const { invoke: mockModelInvoke } = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

const { getOrder, cancelOrder } = vi.hoisted(() => ({
    getOrder: vi.fn(),
    cancelOrder: vi.fn(),
}));

vi.mock("../../llm/model.js", () => ({
    model: { bindTools: () => ({ invoke: mockModelInvoke }) },
}));

vi.mock("../../services/order.service.js", () => ({
    orderService: { getOrder, cancelOrder },
}));

const { orderGraph } = await import("./graph.js");

function config(threadId: string) {
    return { configurable: { thread_id: threadId } };
}

describe("orderGraph", () => {
    beforeEach(() => {
        mockModelInvoke.mockReset();
        getOrder.mockReset();
        cancelOrder.mockReset();
    });

    it("rejects cancellation without ever calling the LLM when the order isn't Processing", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1002",
            customer: "John",
            status: "Delivered",
            expectedDelivery: "Yesterday",
        });

        const result = await orderGraph.invoke(
            { messages: [new HumanMessage("Please cancel order ORD-1002")] },
            config("cancel-ineligible")
        );

        expect(mockModelInvoke).not.toHaveBeenCalled();
        expect(cancelOrder).not.toHaveBeenCalled();
        const lastMessage = result.messages.at(-1);
        expect(lastMessage?.content).toBe(
            "Order cannot be cancelled because it is currently Delivered."
        );
    });

    it("interrupts for approval, then cancels on 'y' without the LLM ever being called", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1001",
            customer: "Sarvesh",
            status: "Processing",
            expectedDelivery: "Tomorrow",
        });
        cancelOrder.mockResolvedValue({
            success: true,
            message: "Order cancelled successfully",
            order: {
                orderId: "ORD-1001",
                customer: "Sarvesh",
                status: "Cancelled",
                expectedDelivery: "Tomorrow",
            },
        });

        const threadConfig = config("cancel-approved");
        const first = await orderGraph.invoke(
            { messages: [new HumanMessage("Please cancel order ORD-1001")] },
            threadConfig
        );

        expect("__interrupt__" in first).toBe(true);
        expect((first as any).__interrupt__[0].value).toEqual({
            type: "cancel_order",
            orderId: "ORD-1001",
            message: "Approve cancellation of order ORD-1001?",
        });

        const second = await orderGraph.invoke(
            new Command({ resume: "y" }),
            threadConfig
        );

        expect(cancelOrder).toHaveBeenCalledWith("ORD-1001");
        expect(mockModelInvoke).not.toHaveBeenCalled();
        const lastMessage = second.messages.at(-1);
        expect(lastMessage?.content).toBe("Order cancelled successfully");
    });

    it("does not cancel when approval is denied with 'n'", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1001",
            customer: "Sarvesh",
            status: "Processing",
            expectedDelivery: "Tomorrow",
        });

        const threadConfig = config("cancel-denied");
        await orderGraph.invoke(
            { messages: [new HumanMessage("Please cancel order ORD-1001")] },
            threadConfig
        );

        await orderGraph.invoke(new Command({ resume: "n" }), threadConfig);

        expect(cancelOrder).not.toHaveBeenCalled();
    });

    it("runs the agent/tool loop for a non-cancellation order question", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1003",
            customer: "Jane",
            status: "Processing",
            expectedDelivery: "Day after tomorrow",
        });

        mockModelInvoke
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "",
                    tool_calls: [
                        {
                            name: "get_order",
                            args: { orderId: "ORD-1003" },
                            id: "call_1",
                            type: "tool_call",
                        },
                    ],
                })
            )
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "Your order ORD-1003 is currently Processing.",
                    tool_calls: [],
                })
            );

        const result = await orderGraph.invoke(
            { messages: [new HumanMessage("Where is my order ORD-1003?")] },
            config("agent-loop")
        );

        expect(getOrder).toHaveBeenCalledWith("ORD-1003");
        expect(mockModelInvoke).toHaveBeenCalledTimes(2);
        const lastMessage = result.messages.at(-1);
        expect(lastMessage?.content).toBe(
            "Your order ORD-1003 is currently Processing."
        );
    });
});
