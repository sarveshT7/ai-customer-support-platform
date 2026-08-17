import { ParsedBlock } from "../parsers/markdown.parser.js";

export interface PreparedChunk {
    chunkIndex: number;
    content: string;
    section: string;
}

export function chunkBlocks(blocks: ParsedBlock[]): PreparedChunk[] {
    const chunks: PreparedChunk[] = [];

    const sectionPath: string[] = [];
    let currentContent: string[] = [];

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
    };

    for (const block of blocks) {
        if (block.kind === "heading") {
            flushChunk();

            sectionPath.splice(block.level - 1);

            sectionPath[block.level - 1] = block.text;

            continue;
        }

        currentContent.push(block.text);
    }

    flushChunk();

    return chunks;
}