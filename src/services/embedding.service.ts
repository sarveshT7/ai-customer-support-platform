import { embeddings } from "../llm/embeddings.js";

export class EmbeddingService {
    async embedText(text: string): Promise<number[]> {
        return await embeddings.embedQuery(text);
    }

    async embedTexts(texts: string[]): Promise<number[][]> {
        return await embeddings.embedDocuments(texts);
    }
}

export const embeddingService = new EmbeddingService();