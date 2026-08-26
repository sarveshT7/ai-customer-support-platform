import { Kysely, sql } from "kysely";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../../models/ticket.js";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("tickets")
    .addColumn("ticket_id", "text", (col) => col.primaryKey())
    .addColumn("issue", "text", (col) => col.notNull())
    .addColumn("category", "text", (col) =>
      col
        .notNull()
        .check(
          sql`category IN (${sql.join(
            TICKET_CATEGORIES.map((category) => sql.lit(category)),
          )})`,
        ),
    )
    .addColumn("order_id", "text", (col) =>
      col.notNull().references("orders.order_id"),
    )
    .addColumn("priority", "text", (col) =>
      col
        .notNull()
        .check(
          sql`priority IN (${sql.join(
            TICKET_PRIORITIES.map((priority) => sql.lit(priority)),
          )})`,
        ),
    )
    .addColumn("status", "text", (col) =>
      col
        .notNull()
        .defaultTo("Open")
        .check(
          sql`status IN (${sql.join(
            TICKET_STATUSES.map((status) => sql.lit(status)),
          )})`,
        ),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("idx_tickets_order_id")
    .on("tickets")
    .column("order_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("tickets").ifExists().execute();
}
