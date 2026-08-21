import { retrievalService } from "../retrieval.service.js";

const query =
    process.argv.slice(2).join(" ") ||
    "Can I return a product after 30 days?";

const results = await retrievalService.retrieve(query, 3);

console.log(`\nQuery: ${query}\n`);

for (const result of results) {
    console.log({
        chunkIndex: result.chunk_index,
        content: result.content,
        distance: result.distance,
    });
}