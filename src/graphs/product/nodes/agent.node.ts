import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { interrupt } from "@langchain/langgraph";

import { SupportState } from "../state.js";
import { SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { productModel } from "../model.js";
import { formatRetrievedContext } from "../context-formatter.js";

export async function agentNode(
  state: typeof SupportState.State
) {
  const context = formatRetrievedContext(state.retrievedChunks)
  const response = await productModel.invoke([
    SYSTEM_PROMPT,
    new SystemMessage(
      `Relevant knowledge base context:\n\n${context}`,
    ),
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