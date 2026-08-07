
export type TicketStatus = "Open" | "In Progress" | "Closed";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export interface Ticket {
    ticketId: string;
    // customerId: string;
    issue: string;
    category: string;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
}