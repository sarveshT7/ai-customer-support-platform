import { AIMessage } from "@langchain/core/messages";
import { interrupt } from "@langchain/langgraph";

import { SupportState } from "../state.js";
import { SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { ticketModel } from "../model.js";

export async function agentNode(
  state: typeof SupportState.State
) {
  const response = await ticketModel.invoke([
    SYSTEM_PROMPT,
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