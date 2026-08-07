import { AIMessage } from "@langchain/core/messages";
import { interrupt } from "@langchain/langgraph";

import { SupportState } from "../state.js";
import { SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { orderModel } from "../model.js";

export async function agentNode(
  state: typeof SupportState.State
) {
  const response = await orderModel.invoke([
    SYSTEM_PROMPT,
    ...state.messages,
  ]);

  console.log(
    "Tool calls:",
    JSON.stringify(response.tool_calls, null, 2)
  );

  const cancelToolCall = response.tool_calls?.find(
    (tool) => tool.name === "cancel_order"
  );

  if (cancelToolCall) {
    const approval = interrupt({
      type: "cancel_order",
      orderId: cancelToolCall.args.orderId,
      message: `Approve cancellation of order ${cancelToolCall.args.orderId}?`,
    });

    if (approval.toLowerCase() !== "y") {
      return {
        messages: [
          new AIMessage("Cancellation of order is rejected"),
        ],
      };
    }
  }

  return {
    messages: [response],
  };
}