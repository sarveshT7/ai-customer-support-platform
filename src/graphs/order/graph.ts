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
import { verifyCancellationNode } from "./nodes/verify-cancellation.node.js";
import { cancellationResponseNode } from "./nodes/cancellation-response.node.js";

const memory = new MemorySaver()

export const orderGraph = new StateGraph(SupportState)

  .addNode("detectCancellation", cancellationNode)
  .addNode("verifyCancellation", verifyCancellationNode)
  .addNode("approval", cancellationApprovalNode)
  .addNode("cancel", cancelNode)
  .addNode("cancellationResponse", cancellationResponseNode)

  .addNode("agent", agentNode)
  .addNode("tools", orderToolsNode)

  .addEdge(START, "detectCancellation")

  .addConditionalEdges(
    "detectCancellation",
    (state) => {
      if (state.cancellation.requested) {
        return "verifyCancellation";
      }

      return "agent";
    },
    {
      verifyCancellation: "verifyCancellation",
      agent: "agent",
    }
  )

  .addConditionalEdges(
    "verifyCancellation",
    (state) => {
      return state.cancellation.canCancel
        ? "approval"
        : "cancellationResponse";
    },
    {
      approval: "approval",
      cancellationResponse: "cancellationResponse",
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
      [END]: END
    }
  )

  .addEdge("cancel", "cancellationResponse")
  .addEdge("cancellationResponse", END)

  .addConditionalEdges("agent", toolsCondition)

  .addEdge("tools", "agent")

  .compile({
    checkpointer: memory
  });