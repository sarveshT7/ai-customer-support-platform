import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();


export const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
    configuration: {
        baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    },
})