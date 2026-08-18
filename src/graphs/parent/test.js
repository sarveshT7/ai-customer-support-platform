import { HumanMessage } from "@langchain/core/messages";
import { parentGraph } from "./graph.js";
const config = {
    configurable: {
        thread_id: "customer-1",
    },
};
const first = await parentGraph.invoke({
    messages: [
        new HumanMessage("Where is my order ORD-1001?")
    ],
}, config);
console.log("\n--- FIRST RESPONSE ---");
console.log(first.messages[first.messages.length - 1].content);
const second = await parentGraph.invoke({
    messages: [
        new HumanMessage("What is its current status?")
    ],
}, config);
console.log("\n--- SECOND RESPONSE ---");
console.log(second.messages[second.messages.length - 1].content);
