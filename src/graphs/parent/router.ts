export const DOMAIN = {
    ORDER: "order",
    TICKET: "ticket",
    PRODUCT: "product",
} as const;

export type Domain =
    (typeof DOMAIN)[keyof typeof DOMAIN];

export function detectDomain(message: string): Domain {
    const text = message.toLowerCase();

    if (
        text.includes("order") ||
        text.includes("cancel") ||
        text.includes("delivery")
    ) {
        return DOMAIN.ORDER;
    }

    if (
        text.includes("ticket") ||
        text.includes("issue") ||
        text.includes("damaged") ||
        text.includes("refund")
    ) {
        return DOMAIN.TICKET;
    }

    return DOMAIN.PRODUCT;
}