import { HumanMessage } from "@langchain/core/messages";
import { ticketGraph } from "./graph.js";

const config = {
    configurable: {
        thread_id: "customer-1",
    },
};

// Request 1
const result1 = await ticketGraph.invoke(
    {
        messages: [
            new HumanMessage(
                "My laptop is damaged. Please create a support ticket."
            ),
        ],
    },
    config
);

console.log("\n--- RESULT 1 ---");
console.log(result1);

// Request 2 — SAME thread_id
const result2 = await ticketGraph.invoke(
    {
        messages: [
            new HumanMessage("ORD-1001"),
        ],
    },
    config
);

console.log("\n--- RESULT 2 ---");
console.log(result2);

// Request 3 — SAME thread_id
const result3 = await ticketGraph.invoke(
    {
        messages: [
            new HumanMessage("What is the status of my ticket?"),
        ],
    },
    config
);

console.log("\n--- RESULT 3 ---");
console.log(result3);

const newThreadConfig = {
    configurable: {
        thread_id: "customer-2",
    },
};

const result4 = await ticketGraph.invoke(
    {
        messages: [
            new HumanMessage("Actually, I want to report a different issue with my mouse."),
        ],
    },
    newThreadConfig
);

console.log("\n--- RESULT 4  ---");
console.log(result4);
