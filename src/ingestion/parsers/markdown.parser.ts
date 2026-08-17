export type ParsedBlock =
    | {
        kind: "heading";
        level: number;
        text: string;
    }
    | {
        kind: "paragraph";
        text: string;
    };

export interface ParsedDocument {
    title: string | null;
    blocks: ParsedBlock[];
}

export function parseMarkdown(content: string): ParsedDocument {
    const lines = content.split(/\r?\n/);

    const blocks: ParsedBlock[] = [];

    let paragraphLines: string[] = [];

    const flushParagraph = () => {
        const text = paragraphLines.join(" ").trim();

        if (text) {
            blocks.push({
                kind: "paragraph",
                text,
            });
        }

        paragraphLines = [];
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            continue;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

        if (headingMatch) {
            flushParagraph();

            blocks.push({
                kind: "heading",
                level: headingMatch[1].length,
                text: headingMatch[2].trim(),
            });

            continue;
        }

        paragraphLines.push(trimmed);
    }

    flushParagraph();

    return {
        title: blocks.find(
            (block) => block.kind === "heading" && block.level === 1
        )?.text ?? null,
        blocks,
    };
}