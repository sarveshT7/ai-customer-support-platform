import { describe, expect, it, vi } from "vitest";
import { writeFile, unlink } from "node:fs/promises";
import { FileIngestionService } from "./file-ingestion.service.js";
import { IngestionService } from "../services/ingestion.service.js";

describe("FileIngestionService", () => {
    it("reads a file and passes its content to IngestionService", async () => {
        const filePath = "/tmp/test-return-policy.md";

        const markdown = `
# Return Policy

Customers can return products within 30 days.
`;

        await writeFile(filePath, markdown, "utf-8");

        const ingest = vi.fn().mockResolvedValue({
            document: {
                id: "doc-1",
            },
            chunks: [],
        });

        const ingestionService = {
            ingest,
        } as unknown as IngestionService;

        const fileIngestionService = new FileIngestionService(
            ingestionService,
        );

        await fileIngestionService.ingestFile({
            filePath,
            source: "return-policy.md",
            sourceType: "markdown",
            mimeType: "text/markdown",
        });

        expect(ingest).toHaveBeenCalledWith({
            content: markdown,
            source: "return-policy.md",
            sourceType: "markdown",
            mimeType: "text/markdown",
        });

        await unlink(filePath);
    });

    it("propagates file read errors", async () => {
        const ingest = vi.fn();

        const ingestionService = {
            ingest,
        } as unknown as IngestionService;

        const fileIngestionService = new FileIngestionService(
            ingestionService,
        );

        await expect(
            fileIngestionService.ingestFile({
                filePath: "/tmp/does-not-exist.md",
                source: "does-not-exist.md",
                sourceType: "markdown",
                mimeType: "text/markdown",
            }),
        ).rejects.toThrow();

        expect(ingest).not.toHaveBeenCalled();
    });
});