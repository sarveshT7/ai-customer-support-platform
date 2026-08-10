import {
  END,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";

import { SupportState } from "./state.js";

import { agentNode } from "./nodes/agent.node.js";
import { cancellationNode } from "./nodes/cancellation.node.js";
import { cancellationApprovalNode } from "./nodes/cancellation-approval.node.js";
import { cancelNode } from "./nodes/cancel.node.js";

import { orderToolsNode } from "./tools.node.js";
import { toolsCondition } from "@langchain/langgraph/prebuilt";

const memory = new MemorySaver()

export const orderGraph = new StateGraph(SupportState)

  .addNode("detectCancellation", cancellationNode)
  .addNode("approval", cancellationApprovalNode)
  .addNode("cancel", cancelNode)

  .addNode("agent", agentNode)
  .addNode("tools", orderToolsNode)

  .addEdge(START, "detectCancellation")

  .addConditionalEdges(
    "detectCancellation",
    (state) => {
      if (state.cancellation.requested) {
        return "approval";
      }

      return "agent";
    },
    {
      approval: "approval",
      agent: "agent",
    }
  )

  .addConditionalEdges(
    "approval",
    (state) => {
      return state.cancellation.approved
        ? "cancel"
        : END;
    },
    {
      cancel: "cancel",
      [END]: END,
    }
  )

  .addEdge("cancel", END)

  .addConditionalEdges("agent", toolsCondition)

  .addEdge("tools", "agent")

  .compile({
    checkpointer: memory
  });