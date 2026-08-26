export const DOMAIN = {
    ORDER: "order",
    TICKET: "ticket",
    PRODUCT: "product",
} as const;

export type Domain =
    (typeof DOMAIN)[keyof typeof DOMAIN] | undefined;

export function detectDomain(message: string): Domain {
    const text = message.toLowerCase();

    if (
        text.includes("ticket") ||
        text.includes("issue") ||
        text.includes("damaged") ||
        text.includes("refund")
    ) {
        return DOMAIN.TICKET;
    }

    if (
        text.includes("order") ||
        text.includes("cancel") ||
        text.includes("delivery")
    ) {
        return DOMAIN.ORDER;
    }

    return DOMAIN.PRODUCT;
}