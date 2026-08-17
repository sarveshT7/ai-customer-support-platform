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


function splitOversizedBlock(
    text: string,
    maxTokens: number,
    countTokens: (text: string) => number,
): string[] {
    const words = text.trim().split(/\s+/);

    const parts: string[] = [];

    let current: string[] = [];

    for (const word of words) {
        const candidate = [...current, word].join(" ");

        if (
            current.length > 0 &&
            countTokens(candidate) > maxTokens
        ) {
            parts.push(current.join(" "));
            current = [word];
        } else {
            current.push(word);
        }
    }

    if (current.length > 0) {
        parts.push(current.join(" "));
    }

    return parts;
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
        // Over sized block
        if (blockTokenCount > options.maxTokens) {
            const parts = splitOversizedBlock(
                block.text,
                options.maxTokens,
                options.countTokens,
            );

            for (const part of parts) {
                const partTokenCount = options.countTokens(part);

                if (
                    currentContent.length > 0 &&
                    currentTokenCount + partTokenCount > options.targetTokens
                ) {
                    flushChunk();
                }

                currentContent.push(part);
                currentTokenCount += partTokenCount;
            }

            continue;
        }

        // Normal block
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