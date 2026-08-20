import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { SimilarChunk } from "../repositories/document.repository.js";

export const SupportState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),
    retrievedChunks: Annotation<SimilarChunk[]>({
        reducer: (_, update) => update,
        default: () => [],
    }),
});