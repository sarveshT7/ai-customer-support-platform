import dotenv from "dotenv";
dotenv.config();

const DEFAULT_RERANK_MODEL = "nvidia/llama-nemotron-rerank-vl-1b-v2:free";
const DEFAULT_TIMEOUT_MS = 8_000;
// If the daily quota is exhausted, OpenRouter's X-RateLimit-Reset header tells us exactly when
// it resets; if that header is missing for some reason, fall back to a conservative cooldown
// so we're not hammering a known-exhausted endpoint on every single retrieval in the meantime.
const DEFAULT_COOLDOWN_MS = Number(
    process.env.RAG_RERANK_COOLDOWN_MS ?? 5 * 60 * 1000,
);

export interface RerankCandidate {
    content: string;
}

export interface RerankResult<T> {
    item: T;
    // null means reranking did not actually run (no candidates to rerank, misconfiguration,
    // rate-limited, or a failure) and the original vector-search order was preserved instead.
    relevanceScore: number | null;
}

interface OpenRouterRerankResponse {
    results: { index: number; relevance_score: number }[];
}

export class RerankService {
    // Instance state (not module-level): a rate-limit on one instance shouldn't silently
    // affect unrelated instances, e.g. in tests that construct their own RerankService.
    private rateLimitedUntil: number | null = null;

    constructor(
        private readonly apiKey: string | undefined = process.env.OPENROUTER_API_KEY,
        private readonly baseUrl: string = process.env.OPENROUTER_BASE_URL ??
            "https://openrouter.ai/api/v1",
        private readonly model: string = process.env.OPENROUTER_RERANK_MODEL ??
            DEFAULT_RERANK_MODEL,
        private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
    ) { }

    async rerank<T extends RerankCandidate>(
        query: string,
        candidates: T[],
        topN?: number,
    ): Promise<RerankResult<T>[]> {
        if (candidates.length === 0) {
            return [];
        }

        // Nothing to reorder among a single candidate — skip the network call entirely.
        if (candidates.length === 1) {
            return [{ item: candidates[0], relevanceScore: null }];
        }

        if (!this.apiKey) {
            console.error("Reranking skipped: OPENROUTER_API_KEY is not configured.");
            return this.fallback(candidates, topN);
        }

        if (this.rateLimitedUntil !== null) {
            if (Date.now() < this.rateLimitedUntil) {
                console.error(
                    `Reranking skipped: rate-limited until ${new Date(this.rateLimitedUntil).toISOString()}.`,
                );
                return this.fallback(candidates, topN);
            }
            this.rateLimitedUntil = null;
        }

        // One retry for genuinely transient failures (network blip, 5xx). A 429 is handled
        // separately below via the circuit breaker, since retrying it immediately can't help.
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(`${this.baseUrl}/rerank`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: this.model,
                        query,
                        documents: candidates.map((candidate) => candidate.content),
                        ...(topN !== undefined ? { top_n: topN } : {}),
                    }),
                    signal: AbortSignal.timeout(this.timeoutMs),
                });

                if (response.status === 429) {
                    const resetHeader = response.headers.get("X-RateLimit-Reset");
                    const resetAt = resetHeader ? Number(resetHeader) : NaN;
                    this.rateLimitedUntil = Number.isFinite(resetAt)
                        ? resetAt
                        : Date.now() + DEFAULT_COOLDOWN_MS;
                    console.error(
                        `Reranking rate-limited (429); backing off until ${new Date(this.rateLimitedUntil).toISOString()}.`,
                    );
                    return this.fallback(candidates, topN);
                }

                if (!response.ok) {
                    // Reading the body is best-effort context for the error message — a
                    // Response's body can only be read once, and a failure here (e.g. it was
                    // already consumed) must never mask the actual HTTP status with an
                    // unrelated "body already read" error.
                    const bodyText = await response
                        .text()
                        .catch(() => "<response body unavailable>");
                    throw new Error(
                        `Rerank request failed with status ${response.status}: ${bodyText}`,
                    );
                }

                const data = (await response.json()) as OpenRouterRerankResponse;

                const results = data.results
                    .filter((result) => candidates[result.index] !== undefined)
                    .map((result) => ({
                        item: candidates[result.index],
                        relevanceScore: result.relevance_score,
                    }));

                if (results.length === 0) {
                    throw new Error("Rerank response contained no usable results.");
                }

                return results;
            } catch (error) {
                const isLastAttempt = attempt === 2;
                console.error(
                    `Reranking attempt ${attempt}/2 failed${isLastAttempt ? ", falling back to original order" : ", retrying"}:`,
                    error,
                );
                if (isLastAttempt) {
                    return this.fallback(candidates, topN);
                }
            }
        }

        // Unreachable, but keeps TypeScript satisfied that every path returns.
        return this.fallback(candidates, topN);
    }

    private fallback<T extends RerankCandidate>(
        candidates: T[],
        topN?: number,
    ): RerankResult<T>[] {
        return candidates
            .slice(0, topN ?? candidates.length)
            .map((item) => ({ item, relevanceScore: null }));
    }
}

export const rerankService = new RerankService();
