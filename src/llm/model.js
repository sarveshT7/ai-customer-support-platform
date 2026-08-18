// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { getOrderTool } from "../tools/order.tool.js";
import { createTicketTool } from "../tools/ticket.tool.js";
import { searchProductsTool } from "../tools/searchProducts.tool.js";
import { cancelOrderTool } from "../tools/cancelOrder.tool.js";
dotenv.config();
// export const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash",
//     apiKey: process.env.GEMINI_API_KEY
// });
export const model = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    // model: "openrouter/free",
    model: "deepseek/deepseek-chat-v3",
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
});
export const modelWithTools = model.bindTools([
    getOrderTool,
    createTicketTool,
    searchProductsTool,
    cancelOrderTool
]);
