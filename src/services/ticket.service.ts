import type { TicketRow } from "../database/index.js";
import { TicketRepository, ticketRepository } from "../repositories/ticket.repository.js";
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "../models/ticket.js";

function toTicket(row: TicketRow): Ticket {
    return {
        ticketId: row.ticket_id,
        issue: row.issue,
        category: row.category as TicketCategory,
        orderId: row.order_id,
        priority: row.priority as TicketPriority,
        status: row.status as TicketStatus,
        createdAt: row.created_at.toISOString(),
    };
}

export interface CreateTicketInput {
    issue: string;
    category: TicketCategory;
    orderId: string;
    priority: TicketPriority;
}

export class TicketService {
    constructor(private readonly repository: TicketRepository = ticketRepository) { }

    async createTicket(input: CreateTicketInput): Promise<Ticket> {
        const row = await this.repository.create({
            ticket_id: `TKT-${crypto.randomUUID()}`,
            issue: input.issue,
            category: input.category,
            order_id: input.orderId,
            priority: input.priority,
            status: "Open",
        });

        return toTicket(row);
    }

    async getTicket(ticketId: string): Promise<Ticket | null> {
        const row = await this.repository.findById(ticketId);
        return row ? toTicket(row) : null;
    }
}

export const ticketService = new TicketService();
