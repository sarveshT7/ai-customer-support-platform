export const DOMAIN = {
    ORDER: "order",
    TICKET: "ticket",
    PRODUCT: "product",
} as const;

export type Domain = (typeof DOMAIN)[keyof typeof DOMAIN];

// "ticket" is an unambiguous signal on its own. "issue"/"damaged"/"refund" are not — they show
// up just as often in a general policy question ("how long do I have to return a damaged
// product?") as in an actual complaint ("my order arrived damaged"). Trust them only when the
// message also carries a personal-incident marker (see PERSONAL_INCIDENT_PATTERN below);
// otherwise leave the heuristic undecided so the state-aware/LLM fallback in the router node
// can send genuine policy questions to the product domain, where RAG grounding actually lives.
const TICKET_ANCHOR_KEYWORD = "ticket";
const TICKET_INCIDENT_KEYWORDS = ["issue", "damaged", "refund"];
const ORDER_KEYWORDS = ["order", "cancel", "delivery"];

const ORDER_ID_PATTERN = /\bORD-\d+\b/i;
// A bare "my" is too weak on its own — it shows up in ordinary policy questions ("get my
// refund", "extend my return window") just as often as in real incident reports. Require
// "my" to actually possess a thing that was ordered/received (allowing a word or two in
// between, e.g. "my last order"), or clear past-tense incident language, instead.
const PERSONAL_INCIDENT_PATTERN =
    /\b(my\s+(\w+\s+){0,2}(order|item|product|package|purchase)|i received|i got|it arrived|arrived damaged|arrived broken)\b/i;

// Catches the common "no issue(s)"/"not damaged"/"never had a problem" phrasing so a negated
// mention of a keyword doesn't get treated as a positive signal for that domain.
function isNegated(text: string, keyword: string): boolean {
    const pattern = new RegExp(
        `\\b(no|not|never|n't)\\s+(\\w+\\s+){0,2}${keyword}\\b`,
        "i",
    );
    return pattern.test(text);
}

function matchesKeyword(text: string, keyword: string): boolean {
    const boundary = new RegExp(`\\b${keyword}\\b`, "i");
    return boundary.test(text) && !isNegated(text, keyword);
}

// A fast, high-precision heuristic. Returns undefined (no confident signal) rather than
// guessing when nothing matches — callers decide how to handle that (e.g. stay in the
// current conversation's domain, or ask an LLM to classify).
//
// Ticket-indicating language takes priority over a bare mention of "order": e.g. "my order
// arrived damaged" is a ticket, not just an order-status lookup.
export function detectDomainHeuristic(message: string): Domain | undefined {
    const text = message.toLowerCase();

    if (matchesKeyword(text, TICKET_ANCHOR_KEYWORD)) {
        return DOMAIN.TICKET;
    }

    const hasPersonalIncidentMarker =
        ORDER_ID_PATTERN.test(text) || PERSONAL_INCIDENT_PATTERN.test(text);

    if (
        hasPersonalIncidentMarker &&
        TICKET_INCIDENT_KEYWORDS.some((word) => matchesKeyword(text, word))
    ) {
        return DOMAIN.TICKET;
    }

    if (ORDER_KEYWORDS.some((word) => matchesKeyword(text, word))) {
        return DOMAIN.ORDER;
    }

    return undefined;
}
