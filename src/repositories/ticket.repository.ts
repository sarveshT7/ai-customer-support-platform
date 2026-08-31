import { Kysely } from "kysely";
import type { Database, NewTicketRow, TicketRow } from "../database/index.js";
import { db } from "../database/kysely/db.js";

export class TicketRepository {
    constructor(private readonly database: Kysely<Database> = db) { }

    async create(ticket: NewTicketRow): Promise<TicketRow> {
        return this.database
            .insertInto("tickets")
            .values(ticket)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    async findById(ticketId: string): Promise<TicketRow | null> {
        const ticket = await this.database
            .selectFrom("tickets")
            .selectAll()
            .where("ticket_id", "=", ticketId)
            .executeTakeFirst();

        return ticket ?? null;
    }
}

export const ticketRepository = new TicketRepository();
