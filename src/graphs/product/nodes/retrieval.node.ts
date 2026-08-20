import { RetrievalService } from "../../../retrieval/retrieval.service.js";
import { SupportState } from "../state.js";

export function createRetrievalNode(
    retrievalService: RetrievalService,
) {
    return async function retrievalNode(
        state: typeof SupportState.State,
    ) {
        const lastMessage = state.messages.at(-1);

        if (!lastMessage) {
            throw new Error("Retrieval node received no messages.");
        }
        const query = lastMessage.content.toString();

        const retrievedChunks = await retrievalService.retrieve(
            query,
            5,
        );

        return {
            retrievedChunks,
        };
    };
}