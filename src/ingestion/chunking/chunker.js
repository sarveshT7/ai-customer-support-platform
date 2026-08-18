function splitOversizedBlock(text, maxTokens, countTokens) {
    const words = text.trim().split(/\s+/);
    const parts = [];
    let current = [];
    for (const word of words) {
        const candidate = [...current, word].join(" ");
        if (current.length > 0 &&
            countTokens(candidate) > maxTokens) {
            parts.push(current.join(" "));
            current = [word];
        }
        else {
            current.push(word);
        }
    }
    if (current.length > 0) {
        parts.push(current.join(" "));
    }
    return parts;
}
export function chunkBlocks(blocks, options) {
    const chunks = [];
    const sectionPath = [];
    let currentContent = [];
    let currentTokenCount = 0;
    const flushChunk = (withOverlap = true) => {
        const content = currentContent.join("\n\n").trim();
        if (!content) {
            return;
        }
        chunks.push({
            chunkIndex: chunks.length,
            content,
            section: sectionPath.join(" > "),
        });
        if (withOverlap && options.overlapTokens > 0) {
            const words = content.split(/\s+/);
            const overlap = words.slice(-options.overlapTokens);
            currentContent = overlap.length > 0
                ? [overlap.join(" ")]
                : [];
            currentTokenCount = options.countTokens(currentContent.join(" "));
        }
        else {
            currentContent = [];
            currentTokenCount = 0;
        }
    };
    for (const block of blocks) {
        if (block.kind === "heading") {
            flushChunk(false);
            sectionPath.splice(block.level - 1);
            sectionPath[block.level - 1] = block.text;
            continue;
        }
        const blockTokenCount = options.countTokens(block.text);
        // Over sized block
        if (blockTokenCount > options.maxTokens) {
            const parts = splitOversizedBlock(block.text, options.maxTokens, options.countTokens);
            for (const part of parts) {
                const partTokenCount = options.countTokens(part);
                if (currentContent.length > 0 &&
                    currentTokenCount + partTokenCount > options.targetTokens) {
                    flushChunk();
                }
                currentContent.push(part);
                currentTokenCount += partTokenCount;
            }
            continue;
        }
        // Normal block
        if (currentContent.length > 0 &&
            currentTokenCount + blockTokenCount > options.targetTokens) {
            flushChunk(true);
        }
        currentContent.push(block.text);
        currentTokenCount += blockTokenCount;
    }
    flushChunk();
    return chunks;
}
