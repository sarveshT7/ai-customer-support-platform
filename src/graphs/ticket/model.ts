import { model } from "../../llm/model.js";
import { createTicketTool } from "../../tools/ticket.tool.js";
import { getTicketTool } from "../../tools/getTicket.tool.js";


export const ticketModel = model.bindTools([
    createTicketTool,
    getTicketTool,
]);