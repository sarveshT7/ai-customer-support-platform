import { SimilarChunk } from "../../repositories/document.repository.js";
import { SupportState } from "./state.js";

export function formatRetrievedContext(
    chunks: SimilarChunk[],
): string {
    if (chunks.length === 0) {
        return "No relevant knowledge base context was found.";
    }

    return chunks
        .map(
            (chunk, index) => `
[Source ${index + 1}]
Document: ${chunk.document_title ?? "Unknown"}
Source: ${chunk.source}
Chunk: ${chunk.chunk_index}
Content:
${chunk.content}
`,
        )
        .join("\n");
}