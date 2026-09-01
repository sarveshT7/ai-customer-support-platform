import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RerankService } from "./rerank.service.js";

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("RerankService", () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("returns an empty array without calling the API when there are no candidates", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");

        const result = await service.rerank("query", []);

        expect(result).toEqual([]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("skips the network call for a single candidate", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [{ content: "Only one option." }];

        const result = await service.rerank("query", candidates);

        expect(result).toEqual([{ item: candidates[0], relevanceScore: null }]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("reorders candidates by relevance score from the API response", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1", "test-model");
        const candidates = [
            { content: "Customers can return products within 30 days of purchase." },
            { content: "Damaged products must be reported within 7 days of delivery." },
            { content: "Approved refunds are processed within 5 business days." },
        ];

        fetchMock.mockResolvedValue(
            jsonResponse({
                results: [
                    { index: 1, relevance_score: 0.93 },
                    { index: 0, relevance_score: 0.41 },
                    { index: 2, relevance_score: 0.22 },
                ],
            }),
        );

        const result = await service.rerank("How long to report damage?", candidates, 3);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("https://openrouter.ai/api/v1/rerank");
        expect(init.method).toBe("POST");
        expect(init.headers.Authorization).toBe("Bearer key");
        const body = JSON.parse(init.body as string);
        expect(body).toEqual({
            model: "test-model",
            query: "How long to report damage?",
            documents: candidates.map((c) => c.content),
            top_n: 3,
        });

        expect(result).toEqual([
            { item: candidates[1], relevanceScore: 0.93 },
            { item: candidates[0], relevanceScore: 0.41 },
            { item: candidates[2], relevanceScore: 0.22 },
        ]);
    });

    it("falls back to original order on a non-retryable non-OK response, after one retry", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [
            { content: "First." },
            { content: "Second." },
            { content: "Third." },
        ];

        fetchMock.mockResolvedValue(new Response("server error", { status: 500 }));

        const result = await service.rerank("query", candidates);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result).toEqual([
            { item: candidates[0], relevanceScore: null },
            { item: candidates[1], relevanceScore: null },
            { item: candidates[2], relevanceScore: null },
        ]);
    });

    it("recovers if the retry succeeds after an initial transient failure", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [{ content: "First." }, { content: "Second." }];

        fetchMock
            .mockRejectedValueOnce(new Error("network blip"))
            .mockResolvedValueOnce(
                jsonResponse({
                    results: [{ index: 1, relevance_score: 0.8 }, { index: 0, relevance_score: 0.1 }],
                }),
            );

        const result = await service.rerank("query", candidates);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result).toEqual([
            { item: candidates[1], relevanceScore: 0.8 },
            { item: candidates[0], relevanceScore: 0.1 },
        ]);
    });

    it("falls back to original order when the fetch call throws on every attempt", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [{ content: "First." }, { content: "Second." }];

        fetchMock.mockRejectedValue(new Error("network error"));

        const result = await service.rerank("query", candidates);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result).toEqual([
            { item: candidates[0], relevanceScore: null },
            { item: candidates[1], relevanceScore: null },
        ]);
    });

    it("on a 429, falls back immediately without retrying, and circuit-breaks subsequent calls", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [{ content: "First." }, { content: "Second." }];

        const resetAt = Date.now() + 60_000;
        fetchMock.mockResolvedValue(
            new Response("rate limited", {
                status: 429,
                headers: { "X-RateLimit-Reset": String(resetAt) },
            }),
        );

        const first = await service.rerank("query", candidates);
        expect(fetchMock).toHaveBeenCalledTimes(1); // no retry on 429
        expect(first).toEqual([
            { item: candidates[0], relevanceScore: null },
            { item: candidates[1], relevanceScore: null },
        ]);

        // A second call within the cooldown window should skip the network entirely.
        const second = await service.rerank("query", candidates);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(second).toEqual([
            { item: candidates[0], relevanceScore: null },
            { item: candidates[1], relevanceScore: null },
        ]);
    });

    it("resumes calling the API again once the rate-limit cooldown has passed", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [{ content: "First." }, { content: "Second." }];

        const resetAt = Date.now() + 10;
        fetchMock.mockResolvedValueOnce(
            new Response("rate limited", {
                status: 429,
                headers: { "X-RateLimit-Reset": String(resetAt) },
            }),
        );

        await service.rerank("query", candidates);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        await new Promise((resolve) => setTimeout(resolve, 20));

        fetchMock.mockResolvedValueOnce(
            jsonResponse({
                results: [{ index: 0, relevance_score: 0.7 }, { index: 1, relevance_score: 0.2 }],
            }),
        );

        const result = await service.rerank("query", candidates);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result).toEqual([
            { item: candidates[0], relevanceScore: 0.7 },
            { item: candidates[1], relevanceScore: 0.2 },
        ]);
    });

    it("falls back without calling the API when no API key is configured", async () => {
        // "" rather than undefined: a default-valued constructor param falls back to
        // process.env even when undefined is passed explicitly, which would read the real key.
        const service = new RerankService("", "https://openrouter.ai/api/v1");
        const candidates = [{ content: "First." }, { content: "Second." }];

        const result = await service.rerank("query", candidates);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(result).toEqual([
            { item: candidates[0], relevanceScore: null },
            { item: candidates[1], relevanceScore: null },
        ]);
    });

    it("respects topN when falling back", async () => {
        const service = new RerankService("key", "https://openrouter.ai/api/v1");
        const candidates = [
            { content: "First." },
            { content: "Second." },
            { content: "Third." },
        ];

        fetchMock.mockRejectedValue(new Error("network error"));

        const result = await service.rerank("query", candidates, 2);

        expect(result).toEqual([
            { item: candidates[0], relevanceScore: null },
            { item: candidates[1], relevanceScore: null },
        ]);
    });
});
