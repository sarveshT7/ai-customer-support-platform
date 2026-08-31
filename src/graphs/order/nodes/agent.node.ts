import { SupportState } from "../state.js";
import { ORDER_SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { orderModel } from "../model.js";

export async function agentNode(
  state: typeof SupportState.State
) {
  const response = await orderModel.invoke([
    ORDER_SYSTEM_PROMPT,
    ...state.messages,
  ]);

  console.log(
    "Tool calls:",
    JSON.stringify(response.tool_calls, null, 2)
  );

  return {
    messages: [response],
  };
}