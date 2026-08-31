import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
dotenv.config();

export const model = new ChatOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat-v3",
    // Without an explicit cap, ChatOpenAI requests the model's full context ceiling as
    // max_tokens on every call. OpenRouter checks affordability against that requested
    // ceiling (not actual usage), so low-balance accounts get a 402 even for short replies.
    maxTokens: Number(process.env.OPENROUTER_MAX_TOKENS ?? 1024),
    configuration: {
      baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    },
  });
