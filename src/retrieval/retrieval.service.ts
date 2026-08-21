import { DocumentRepository, SimilarChunk } from "../repositories/document.repository.js";
import {
    embeddingService as defaultEmbeddingService,
    EmbeddingService,
} from "../services/embedding.service.js";
const DEFAULT_MAX_DISTANCE = 0.5;

export class RetrievalService {
    constructor(
        private readonly embeddingService: EmbeddingService =
            defaultEmbeddingService,
        private readonly documentRepository: DocumentRepository = new DocumentRepository(),
    ) { }

    async retrieve(
        query: string,
        topK = 5,
        documentId?: string,
        maxDistance = DEFAULT_MAX_DISTANCE,
    ): Promise<SimilarChunk[]> {
        const queryEmbedding =
            await this.embeddingService.embedText(query);

        return this.documentRepository.searchSimilarChunks(
            queryEmbedding,
            topK,
            documentId,
            maxDistance,
        );
    }
}

export const retrievalService = new RetrievalService();