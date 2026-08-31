import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const { invoke: mockModelInvoke } = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

const { getOrder } = vi.hoisted(() => ({
    getOrder: vi.fn(),
}));

const { retrieve } = vi.hoisted(() => ({
    retrieve: vi.fn(),
}));

vi.mock("../../llm/model.js", () => ({
    model: { bindTools: () => ({ invoke: mockModelInvoke }) },
}));

vi.mock("../../services/order.service.js", () => ({
    orderService: { getOrder },
}));

vi.mock("../../retrieval/retrieval.service.js", () => ({
    retrievalService: { retrieve },
}));

import { parentGraph } from "./graph.js";

function config(threadId: string) {
    return { configurable: { thread_id: threadId } };
}

describe("parentGraph", () => {
    beforeEach(() => {
        mockModelInvoke.mockReset();
        getOrder.mockReset();
        retrieve.mockReset();
        retrieve.mockResolvedValue([]);
    });

    it("routes an order question into the order sub-graph and returns its answer", async () => {
        getOrder.mockResolvedValue({
            orderId: "ORD-1001",
            customer: "Sarvesh",
            status: "Processing",
            expectedDelivery: "Tomorrow",
        });

        mockModelInvoke
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "",
                    tool_calls: [
                        {
                            name: "get_order",
                            args: { orderId: "ORD-1001" },
                            id: "call_1",
                            type: "tool_call",
                        },
                    ],
                })
            )
            .mockResolvedValueOnce(
                new AIMessage({
                    content: "Your order ORD-1001 is currently Processing.",
                    tool_calls: [],
                })
            );

        const result = await parentGraph.invoke(
            { messages: [new HumanMessage("Where is my order ORD-1001?")] },
            config("parent-order")
        );

        expect(getOrder).toHaveBeenCalledWith("ORD-1001");
        const lastMessage = result.messages.at(-1);
        expect(lastMessage?.content).toBe(
            "Your order ORD-1001 is currently Processing."
        );
    });

    it("routes a product question into the product sub-graph, never touching order tools", async () => {
        mockModelInvoke.mockResolvedValueOnce(
            new AIMessage({
                content: "We carry a range of laptops — could you share a budget?",
                tool_calls: [],
            })
        );

        const result = await parentGraph.invoke(
            { messages: [new HumanMessage("What laptops do you have?")] },
            config("parent-product")
        );

        expect(getOrder).not.toHaveBeenCalled();
        const lastMessage = result.messages.at(-1);
        expect(lastMessage?.content).toBe(
            "We carry a range of laptops — could you share a budget?"
        );
    });
});
