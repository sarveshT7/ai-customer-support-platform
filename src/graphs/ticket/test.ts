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
            new HumanMessage("My laptop from order ORD-100188 is damaged. Please create a support ticket."),
        ],
    },
    config
);

console.dir(result, { depth: null });
