
export type TicketStatus = "Open" | "In Progress" | "Closed";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export interface Ticket {
    ticketId: string;
    // customerId: string;
    issue: string;
    category: string;
    orderId: string;
    priority: TicketPriority;
    status: TicketStatus;
    requested?: boolean;
    verified?: boolean;
    orderExists?: boolean;
    created?: boolean;
    createdAt: string;
}