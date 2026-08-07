import { ToolNode } from "@langchain/langgraph/prebuilt";
import { cancelOrderTool } from "../../tools/cancelOrder.tool.js";
import { getOrderTool } from "../../tools/order.tool.js";


export const orderToolsNode = new ToolNode([
    getOrderTool,
    cancelOrderTool
  ])
  