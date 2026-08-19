import { FileIngestionService } from "./file-ingestion.service.js";
import { chunkingOptions } from "./config.js";
import { documentService } from "../services/document.service.js";
import { IngestionService } from "../services/ingestion.service.js";
import { embeddingService } from "../services/embedding.service.js";

export const ingestionService = new IngestionService(
    documentService,
    embeddingService,
    chunkingOptions,
);

export const fileIngestionService = new FileIngestionService(
    ingestionService,
);