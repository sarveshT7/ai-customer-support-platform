import { retrievalService } from "./retrieval.service.js";

const results = await retrievalService.retrieve(
    "Can I return a product after 20 days?",
    3,
);

for (const result of results) {
    console.log({
        chunkIndex: result.chunk_index,
        content: result.content,
        distance: result.distance,
    });
}