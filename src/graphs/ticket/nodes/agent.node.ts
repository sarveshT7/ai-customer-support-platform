import { HumanMessage } from "@langchain/core/messages";

import { SupportState } from "../state.js";
import { TICKET_SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { ticketModel } from "../model.js";

export async function agentNode(
  state: typeof SupportState.State
) {
  const ticketContext = `
  Ticket state:
  ${JSON.stringify(state.ticket)}
  `;

  const response = await ticketModel.invoke([
    TICKET_SYSTEM_PROMPT,
    ...state.messages,
    new HumanMessage(ticketContext),
  ]);
  // console.log("AI response:", response.content);

  console.log(
    "Tool calls:",
    JSON.stringify(response.tool_calls, null, 2)
  );


  return {
    messages: [response],
  };


}