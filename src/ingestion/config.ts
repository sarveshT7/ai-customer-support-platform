import { ChunkingOptions } from "./chunking/chunker.js";

const countTokens = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
};

export const chunkingOptions: ChunkingOptions = {
    targetTokens: 400,
    maxTokens: 600,
    overlapTokens: 50,
    countTokens,
};