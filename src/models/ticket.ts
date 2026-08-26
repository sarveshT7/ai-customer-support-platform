export const TICKET_CATEGORIES = [
    "Technical",
    "Delivery",
    "Damaged Product",
    "Refund",
    "Payment",
    "Warranty",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["Open", "In Progress", "Closed"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface Ticket {
    ticketId: string;
    issue: string;
    category: TicketCategory;
    orderId: string;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
}
