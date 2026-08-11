import { HumanMessage } from "@langchain/core/messages";
import { ticketGraph } from "./graph.js";

const config = {
    configurable: {
        thread_id: "ticket-test-1",
    },
};

const result = await ticketGraph.invoke(
    {
        messages: [
            new HumanMessage("My laptop is damaged. Please create a support ticket."),
        ],
    },
    config
);
const result2 = await ticketGraph.invoke(
    {
        messages: [new HumanMessage("ORD-1001")],
    },
    config
);
console.log("result1");
console.dir(result, { depth: null });
console.log("\n result2");
console.dir(result2, { depth: null });