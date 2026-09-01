// Temporary debugging script — inspects raw vector retrieval candidates for a fixed set of
// queries using the existing retrievalService, unmodified. No reranking, no production code
// changes. Run with: npx tsx src/retrieval/scripts/debug-retrieval.ts

import { retrievalService } from "../retrieval.service.js";

const QUERIES = [
    "How long do I have to report a damaged product?",
    "Can I return a product within 30 days?",
    "How long does an approved refund take?",
    "Can I exchange my product?",
    "What is the warranty period?",
];

const PREVIEW_LENGTH = 80;

function preview(content: string): string {
    const trimmed = content.trim();
    return trimmed.length > PREVIEW_LENGTH
        ? `${trimmed.slice(0, PREVIEW_LENGTH)}...`
        : trimmed;
}

for (const query of QUERIES) {
    const results = await retrievalService.retrieve(query, 5);

    console.log(`\nQuery: ${query}`);
    console.log(`\nRetrieved: ${results.length} chunk${results.length === 1 ? "" : "s"}\n`);

    results.forEach((result, index) => {
        console.log(`${index + 1}. Chunk: ${result.chunk_index}`);
        console.log(`   Document: ${result.document_title ?? "(untitled)"}`);
        console.log(`   Source: ${result.source}`);
        console.log(`   Distance: ${result.distance.toFixed(4)}`);
        console.log(`   Content: ${preview(result.content)}`);
        console.log();
    });
}

// The underlying pg pool keeps the process alive otherwise.
process.exit(0);
