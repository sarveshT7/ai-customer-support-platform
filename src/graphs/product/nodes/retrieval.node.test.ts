import { HumanMessage } from "@langchain/core/messages";
import { describe, expect, it, vi } from "vitest";

import { SimilarChunk } from "../../../repositories/document.repository.js";
import { RetrievalService } from "../../../retrieval/retrieval.service.js";
import { createRetrievalNode } from "./retrieval.node.js";

describe("retrievalNode", () => {
    it("retrieves chunks using the latest user message", async () => {
        const similarChunks: SimilarChunk[] = [
            {
                id: "chunk-1",
                document_id: "document-1",
                chunk_index: 0,
                content: "Customers can return products within 30 days.",
                section: "Returns",
                page_number: null,
                token_count: 8,
                metadata: {},
                created_at: new Date(),
                distance: 0.12,
            },
        ];

        const retrievalService = {
            retrieve: vi.fn().mockResolvedValue(similarChunks),
        } as unknown as RetrievalService;

        const retrievalNode = createRetrievalNode(retrievalService);

        const result = await retrievalNode({
            messages: [
                new HumanMessage("Can I return a product after 20 days?"),
            ],
            retrievedChunks: [],
        });

        expect(retrievalService.retrieve).toHaveBeenCalledWith(
            "Can I return a product after 20 days?",
            5,
        );

        expect(result.retrievedChunks).toEqual(similarChunks);
    });
});