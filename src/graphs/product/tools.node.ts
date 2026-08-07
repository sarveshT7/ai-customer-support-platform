import { ToolNode } from "@langchain/langgraph/prebuilt";
import { searchProductsTool } from "../../tools/searchProducts.tool.js";


export const productToolsNode = new ToolNode([
  searchProductsTool
]);
  