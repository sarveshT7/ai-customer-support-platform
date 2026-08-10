import { START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { agentNode } from "./nodes/agent.node.js";
import { productToolsNode } from "./tools.node.js";
import { SupportState } from "./state.js";


export const productGraph = new StateGraph(SupportState)
  .addNode("agent", agentNode)
  .addNode("tools", productToolsNode)

  .addEdge(START, "agent")

  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile();
