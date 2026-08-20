import { SupportState } from "./state.js";

export function formatRetrievedContext(
    chunks: typeof SupportState.State["retrievedChunks"],
): string {
    if (chunks.length === 0) {
        return "No relevant knowledge-base information was found.";
    }

    return chunks
        .map(
            (chunk, index) =>
                `[Source ${index + 1}]\n${chunk.content}`,
        )
        .join("\n\n");
} 