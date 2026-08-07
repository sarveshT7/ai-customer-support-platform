import { model } from "../../llm/model.js";
import { createTicketTool } from "../../tools/ticket.tool.js";


export const ticketModel = model.bindTools([
    createTicketTool
]);