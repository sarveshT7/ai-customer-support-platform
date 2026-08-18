import { HumanMessage } from "@langchain/core/messages";
import { SYSTEM_PROMPT } from "../../../prompts/system.prompt.js";
import { ticketModel } from "../model.js";
export async function agentNode(state) {
    const ticketContext = `
  Ticket state:
  ${JSON.stringify(state.ticket)}
  `;
    const response = await ticketModel.invoke([
        SYSTEM_PROMPT,
        ...state.messages,
        new HumanMessage(ticketContext),
    ]);
    // console.log("AI response:", response.content);
    console.log("Tool calls:", JSON.stringify(response.tool_calls, null, 2));
    return {
        messages: [response],
    };
}
