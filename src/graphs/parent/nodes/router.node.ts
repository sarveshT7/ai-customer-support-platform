import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { DOMAIN, Domain, detectDomainHeuristic } from "../router.js";
import { ParentState } from "../state.js";
import { model } from "../../../llm/model.js";

const DomainSchema = z.object({
    domain: z
        .enum([DOMAIN.ORDER, DOMAIN.TICKET, DOMAIN.PRODUCT])
        .describe("The single support domain that best matches the customer's message."),
});

const domainClassifier = model.withStructuredOutput(DomainSchema);

async function classifyDomainWithLLM(
    message: string,
    previousDomain?: Domain,
): Promise<Domain> {
    const context = previousDomain
        ? `The previous message in this conversation was classified as the "${previousDomain}" domain.`
        : "This is the first message in the conversation.";

    const result = await domainClassifier.invoke([
        new SystemMessage(
            `Classify the customer's latest message into exactly one support domain:
- "order": the customer is asking about an order they placed — its status, delivery, or wants to cancel it.
- "ticket": the customer is describing something that actually happened to their own order or item and needs it resolved — e.g. "my item arrived broken", "I never received my refund" — or explicitly asking to create/check a support ticket. Only use this when a real, specific incident is being reported.
- "product": browsing or asking about products, or a GENERAL question about store policies (return windows, refund timelines, damaged-item policy, warranty terms, shipping, etc.). A question phrased hypothetically or generally — "how long do I have to...", "what is your policy on...", "can I return...", "what happens if..." — is a policy question, not a ticket, even if it mentions words like "damaged" or "refund". Only classify as "ticket" when the customer describes something that happened to them specifically, not when they're asking about the rules in general.

${context}`,
        ),
        new HumanMessage(message),
    ]);

    return result.domain;
}

export async function routerNode(state: typeof ParentState.State) {
    if (!state?.messages || state.messages.length === 0) {
        throw new Error("Parent graph received no messages.");
    }

    const lastMessage = state.messages[state.messages.length - 1];
    const text = lastMessage.content.toString();

    const heuristicMatch = detectDomainHeuristic(text);
    if (heuristicMatch) {
        return { domain: heuristicMatch };
    }

    // No confident keyword signal. If the conversation is already underway, stay in the
    // current domain instead of guessing — this is what keeps a follow-up like "what's its
    // status?" routed to the order sub-graph instead of falling back to product.
    if (state.domain) {
        return { domain: state.domain };
    }

    const domain = await classifyDomainWithLLM(text);
    return { domain };
}
