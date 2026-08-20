import { START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { agentNode } from "./nodes/agent.node.js";
import { productToolsNode } from "./tools.node.js";
import { SupportState } from "./state.js";
import { createRetrievalNode } from "./nodes/retrieval.node.js";
import { retrievalService } from "../../retrieval/retrieval.service.js";

const retrievalNode = createRetrievalNode(retrievalService);

export const productGraph = new StateGraph(SupportState)
  .addNode("retrieval", retrievalNode)
  .addNode("agent", agentNode)
  .addNode("tools", productToolsNode)

  .addEdge(START, "retrieval")
  .addEdge("retrieval","agent")

  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile();
