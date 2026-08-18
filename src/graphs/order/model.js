import { model } from "../../llm/model.js";
import { getOrderTool } from "../../tools/order.tool.js";
export const orderModel = model.bindTools([
    getOrderTool,
]);
