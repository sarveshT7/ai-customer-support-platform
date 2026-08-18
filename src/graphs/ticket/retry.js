export function isRetryableError(error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error);
    return (message.includes("timeout") ||
        message.includes("429") ||
        message.includes("rate limit") ||
        message.includes("temporarily unavailable") ||
        message.includes("service unavailable"));
}
export async function withRetry(operation, maxRetries = 2) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            const isLastAttempt = attempt === maxRetries;
            if (isLastAttempt || !isRetryableError(error)) {
                throw error;
            }
            console.log(`Retrying operation... attempt ${attempt + 2}/${maxRetries + 1}`);
            // Small delay before retry
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    throw lastError;
}
