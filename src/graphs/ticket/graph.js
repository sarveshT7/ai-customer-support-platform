import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { agentNode } from "./nodes/agent.node.js";
import { SupportState } from "./state.js";
import { ticketToolsNode } from "./tools.node.js";
import { verifyOrderNode } from "./nodes/verify-order.node.js";
import { ticketNode } from "./nodes/ticket.node.js";
import { ticketResponseNode } from "./nodes/ticket.response.node.js";
import { ticketToolResultNode } from "./nodes/ticket.tool.result.node.js";
const memory = new MemorySaver();
export const ticketGraph = new StateGraph(SupportState)
    .addNode("detectTicket", ticketNode)
    .addNode("verifyOrder", verifyOrderNode)
    .addNode("ticketResponse", ticketResponseNode)
    .addNode("ticketToolResult", ticketToolResultNode)
    .addNode("agent", agentNode)
    .addNode("tools", ticketToolsNode)
    .addEdge(START, "detectTicket")
    .addConditionalEdges("detectTicket", (state) => {
    if (state.ticket.requested && state.ticket.orderId) {
        return "verifyOrder";
    }
    return "agent";
}, {
    verifyOrder: "verifyOrder",
    agent: "agent",
})
    .addConditionalEdges("verifyOrder", (state) => {
    return state.ticket.orderExists
        ? "agent"
        : "ticketResponse";
}, {
    agent: "agent",
    ticketResponse: "ticketResponse",
})
    .addConditionalEdges("agent", toolsCondition)
    .addConditionalEdges("tools", (state) => {
    const lastMessage = state.messages.at(-1);
    if (lastMessage?._getType?.() === "tool" &&
        String(lastMessage.content).startsWith("Error:")) {
        return "ticketToolResult";
    }
    return "agent";
}, {
    agent: "agent",
    ticketToolResult: "ticketToolResult",
})
    .addEdge("ticketToolResult", "ticketResponse")
    .addEdge("ticketResponse", END)
    .compile({
    checkpointer: memory,
});
