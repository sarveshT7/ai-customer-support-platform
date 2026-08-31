import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
dotenv.config();

export const model = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat-v3",
    configuration: {
      baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    },
  });
