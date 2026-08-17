import { ParsedBlock } from "../parsers/markdown.parser.js";

export interface PreparedChunk {
    chunkIndex: number;
    content: string;
    section: string;
}

export interface ChunkingOptions {
    targetTokens: number;
    maxTokens: number;
    countTokens: (text: string) => number;
}

export function chunkBlocks(blocks: ParsedBlock[], options: ChunkingOptions): PreparedChunk[] {
    const chunks: PreparedChunk[] = [];

    const sectionPath: string[] = [];
    let currentContent: string[] = [];
    let currentTokenCount = 0;

    const flushChunk = () => {
        const content = currentContent.join("\n\n").trim();

        if (!content) {
            return;
        }

        chunks.push({
            chunkIndex: chunks.length,
            content,
            section: sectionPath.join(" > "),
        });

        currentContent = [];
        currentTokenCount = 0;
    };

    for (const block of blocks) {
        if (block.kind === "heading") {
            flushChunk();

            sectionPath.splice(block.level - 1);

            sectionPath[block.level - 1] = block.text;

            continue;
        }
        const blockTokenCount = options.countTokens(block.text);
        if (
            currentContent.length > 0 &&
            currentTokenCount + blockTokenCount > options.targetTokens
        ) {
            flushChunk();
        }

        currentContent.push(block.text);
        currentTokenCount += blockTokenCount;
    }

    flushChunk();

    return chunks;
}