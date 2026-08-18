import { HumanMessage } from "@langchain/core/messages";
import { orderGraph } from "./graph.js";
const config = {
    configurable: {
        thread_id: "order-test-1",
    },
};
const result = await orderGraph.invoke({
    messages: [
        new HumanMessage("Where is my order ORD-1001?"),
    ],
}, config);
console.dir(result, { depth: null });
