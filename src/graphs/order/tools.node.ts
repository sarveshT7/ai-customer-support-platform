import { ToolNode } from "@langchain/langgraph/prebuilt";
import { getOrderTool } from "../../tools/order.tool.js";


export const orderToolsNode = new ToolNode([
  getOrderTool,
])
