import { START, StateGraph } from "@langchain/langgraph";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { agentNode } from "./nodes/agent.node.js";
import { orderToolsNode } from "./tools.node.js";
import { SupportState } from "./state.js";

const memory = new MemorySaver()


export const orderGraph = new StateGraph(SupportState)
  .addNode("agent", agentNode)
  .addNode("tools", orderToolsNode)

  .addEdge(START, "agent")

  .addConditionalEdges("agent", toolsCondition)
  .addEdge("tools", "agent")
  .compile({
    checkpointer: memory
  });
