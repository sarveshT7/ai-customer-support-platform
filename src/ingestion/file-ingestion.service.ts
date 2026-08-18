import { readFile } from "node:fs/promises";
import { IngestDocumentResult, IngestionService } from "../services/ingestion.service.js";

export interface IngestFileInput {
    filePath: string;
    source?: string;
    sourceType: string;
    mimeType: string;
}


export class FileIngestionService {
    constructor(
        private readonly ingestionService: IngestionService,
    ) { }

    async ingestFile(
        input: IngestFileInput,
    ): Promise<IngestDocumentResult> {
        const content = await readFile(input.filePath, "utf-8");

        return this.ingestionService.ingest({
            content,
            source: input.source ?? input.filePath,
            sourceType: input.sourceType,
            mimeType: input.mimeType,
        });
    }

}