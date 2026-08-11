import { END, START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { agentNode } from "./nodes/agent.node.js";
import { SupportState } from "./state.js";
import { ticketToolsNode } from "./tools.node.js";
import { verifyOrderNode } from "./nodes/verify-order.node.js";
import { ticketNode } from "./nodes/ticket.node.js";
import { ticketResponseNode } from "./nodes/ticket.response.node.js";



export const ticketGraph = new StateGraph(SupportState)
  .addNode("detectTicket", ticketNode)
  .addNode("verifyOrder", verifyOrderNode)
  .addNode("ticketResponse", ticketResponseNode)
  .addNode("agent", agentNode)
  .addNode("tools", ticketToolsNode)

  .addEdge(START, "detectTicket")

  .addConditionalEdges(
    "detectTicket",
    (state) => {
      if (state.ticket.requested && state.ticket.orderId) {
        return "verifyOrder";
      }

      return "agent";
    },
    {
      verifyOrder: "verifyOrder",
      agent: "agent",
    }
  )
  .addConditionalEdges(
    "verifyOrder",
    (state) => {
      return state.ticket.orderExists
        ? "agent"
        : "ticketResponse";
    },
    {
      agent: "agent",
      ticketResponse: "ticketResponse",
    }
  )

  .addEdge("ticketResponse", END)
  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile();
