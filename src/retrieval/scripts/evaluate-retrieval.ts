import { retrievalService } from "../retrieval.service.js";

type EvaluationCase = {
    query: string;
    expectedChunkIndex: number | null;
};

const evaluationCases: EvaluationCase[] = [
    {
        query: "Can I return a product within 30 days?",
        expectedChunkIndex: 0,
    },
    {
        query: "When will I receive my refund?",
        expectedChunkIndex: 2,
    },
    {
        query: "What is the warranty period?",
        expectedChunkIndex: null,
    },
];

const topK = 5;

let top1Correct = 0;
let recallAtKCorrect = 0;
let noContextCorrect = 0;

for (const testCase of evaluationCases) {
    const results = await retrievalService.retrieve(
        testCase.query,
        topK,
    );

    const topResult = results[0];

    console.log(`\nQuery: ${testCase.query}`);

    // No-context evaluation
    if (testCase.expectedChunkIndex === null) {
        const hasRelevantResult =
            results.length > 0 &&
            results.some((result) => result.distance <= 0.5);

        const passed = !hasRelevantResult;

        if (passed) {
            noContextCorrect++;
        }

        console.log(
            `Expected: No relevant context`,
        );
        console.log(
            `Actual: ${hasRelevantResult
                ? "Potentially relevant context found"
                : "No relevant context"
            }`,
        );
        console.log(passed ? "PASS" : "FAIL");

        continue;
    }

    // Top-1 evaluation
    const top1Passed =
        topResult?.chunk_index === testCase.expectedChunkIndex;

    if (top1Passed) {
        top1Correct++;
    }

    // Recall@K evaluation
    const recallAtKPassed = results.some(
        (result) =>
            result.chunk_index === testCase.expectedChunkIndex,
    );

    if (recallAtKPassed) {
        recallAtKCorrect++;
    }

    console.log(
        `Expected chunk: ${testCase.expectedChunkIndex}`,
    );
    console.log(
        `Actual top chunk: ${topResult?.chunk_index ?? "none"}`,
    );
    console.log(
        `Top result distance: ${topResult?.distance ?? "none"
        }`,
    );
    console.log(
        `Top-1: ${top1Passed ? "PASS" : "FAIL"}`,
    );
    console.log(
        `Recall@${topK}: ${recallAtKPassed ? "PASS" : "FAIL"
        }`,
    );
}

const knownAnswerCases = evaluationCases.filter(
    (testCase) => testCase.expectedChunkIndex !== null,
);

console.log("\n--- Evaluation Summary ---");

console.log(
    `Top-1 Accuracy: ${top1Correct}/${knownAnswerCases.length}`,
);

console.log(
    `Recall@${topK}: ${recallAtKCorrect}/${knownAnswerCases.length}`,
);

console.log(
    `No-context Accuracy: ${noContextCorrect}/1`,
);