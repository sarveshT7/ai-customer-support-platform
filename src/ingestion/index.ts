import { FileIngestionService } from "./file-ingestion.service.js";
import { chunkingOptions } from "./config.js";
import { documentService } from "../services/document.service.js";
import { IngestionService } from "../services/ingestion.service.js";

export const ingestionService = new IngestionService(
    documentService,
    chunkingOptions,
);

export const fileIngestionService = new FileIngestionService(
    ingestionService,
);