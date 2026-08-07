import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createTicketTool } from "../../tools/ticket.tool.js";


export const ticketToolsNode = new ToolNode([
    createTicketTool
]);