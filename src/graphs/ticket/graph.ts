import { START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { agentNode } from "./nodes/agent.node.js";
import { SupportState } from "./state.js";
import { ticketToolsNode } from "./tools.node.js";



export const ticketGraph = new StateGraph(SupportState)
  .addNode("agent", agentNode)
  .addNode("tools", ticketToolsNode)

  .addEdge(START, "agent")

  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile();
