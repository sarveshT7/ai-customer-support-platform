import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { interrupt } from "@langchain/langgraph";

import { SupportState } from "../state.js";
import { SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { ticketModel } from "../model.js";

export async function agentNode(
  state: typeof SupportState.State
) {
  const ticketContext = `
Ticket state:
${JSON.stringify(state.ticket)}
`;

  const response = await ticketModel.invoke([
    SYSTEM_PROMPT,
    ...state.messages,
    new HumanMessage(ticketContext),
  ]);

  console.log(
    "Tool calls:",
    JSON.stringify(response.tool_calls, null, 2)
  );

  const ticketUpdate: Partial<typeof state.ticket> = {};

  if (response.tool_calls?.length) {
    const createTicketCall = response.tool_calls.find(
      (call) => call.name === "create_ticket"
    );

    if (createTicketCall) {
      ticketUpdate.orderId = createTicketCall.args.orderId;
    }
  }

  return {
    messages: [response],
    ...(Object.keys(ticketUpdate).length > 0
      ? { ticket: ticketUpdate }
      : {}),
  };


}