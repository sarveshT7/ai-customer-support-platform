import { DocumentRepository, SimilarChunk } from "../repositories/document.repository.js";
import {
    embeddingService as defaultEmbeddingService,
    EmbeddingService,
} from "../services/embedding.service.js";
export class RetrievalService {
    constructor(
        private readonly embeddingService: EmbeddingService =
            defaultEmbeddingService,
        private readonly documentRepository = new DocumentRepository(),
    ) { }

    async retrieve(
        query: string,
        topK = 5,
        documentId?: string,
    ): Promise<SimilarChunk[]> {
        const queryEmbedding =
            await this.embeddingService.embedText(query);

        return this.documentRepository.searchSimilarChunks(
            queryEmbedding,
            topK,
            documentId,
        );
    }
}

export const retrievalService = new RetrievalService();