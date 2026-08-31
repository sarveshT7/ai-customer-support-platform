import { beforeEach, describe, expect, it, vi } from "vitest";
import { HumanMessage } from "@langchain/core/messages";

const { invoke: mockClassifierInvoke } = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("../../../llm/model.js", () => ({
    model: {
        withStructuredOutput: () => ({ invoke: mockClassifierInvoke }),
    },
}));

import { routerNode } from "./router.node.js";
import { DOMAIN } from "../router.js";
import { ParentState } from "../state.js";

function stateWith(
    messages: HumanMessage[],
    domain?: (typeof DOMAIN)[keyof typeof DOMAIN],
): typeof ParentState.State {
    return { messages, domain } as typeof ParentState.State;
}

describe("routerNode", () => {
    beforeEach(() => {
        mockClassifierInvoke.mockReset();
    });

    it("trusts a confident heuristic match without calling the LLM", async () => {
        const result = await routerNode(
            stateWith([new HumanMessage("Please cancel order ORD-1001")]),
        );

        expect(result).toEqual({ domain: DOMAIN.ORDER });
        expect(mockClassifierInvoke).not.toHaveBeenCalled();
    });

    it("stays in the previous domain for a follow-up with no keyword signal", async () => {
        const result = await routerNode(
            stateWith(
                [new HumanMessage("What is its current status?")],
                DOMAIN.ORDER,
            ),
        );

        expect(result).toEqual({ domain: DOMAIN.ORDER });
        expect(mockClassifierInvoke).not.toHaveBeenCalled();
    });

    it("asks the LLM to classify when there is no keyword signal and no prior domain", async () => {
        mockClassifierInvoke.mockResolvedValue({ domain: DOMAIN.PRODUCT });

        const result = await routerNode(
            stateWith([
                new HumanMessage("What laptops do you have under 70000 rupees?"),
            ]),
        );

        expect(result).toEqual({ domain: DOMAIN.PRODUCT });
        expect(mockClassifierInvoke).toHaveBeenCalledTimes(1);
    });

    it("throws when there are no messages", async () => {
        await expect(routerNode(stateWith([]))).rejects.toThrow(
            "Parent graph received no messages.",
        );
    });
});
