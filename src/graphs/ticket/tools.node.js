import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createTicketTool } from "../../tools/ticket.tool.js";
import { getOrderTool } from "../../tools/order.tool.js";
export const ticketToolsNode = new ToolNode([
    createTicketTool,
    getOrderTool
]);
