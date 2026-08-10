import { HumanMessage } from "@langchain/core/messages";
import { orderGraph } from "./graph.js";
import { Command } from "@langchain/langgraph";

const config = {
    configurable: {
        thread_id: "cancel-test-1",
    },
};

const firstResult = await orderGraph.invoke(
    {
        messages: [
            new HumanMessage("Please cancel order ORD-1001"),
        ],
    },
    config
);

console.log("FIRST RESULT:");
console.dir(firstResult, { depth: null });

const secondResult = await orderGraph.invoke(
    new Command({
        resume: "n"
    }),
    config
);

console.log("\nSECOND RESULT:");
console.dir(secondResult, { depth: null });
