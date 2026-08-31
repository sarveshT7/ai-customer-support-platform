import { Kysely, sql } from "kysely";
import { ORDER_STATUSES } from "../../models/order.js";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("orders")
    .addColumn("order_id", "text", (col) => col.primaryKey())
    .addColumn("customer", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) =>
      col
        .notNull()
        .check(
          sql`status IN (${sql.join(
            ORDER_STATUSES.map((status) => sql.lit(status)),
          )})`,
        ),
    )
    .addColumn("expected_delivery", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("orders").ifExists().execute();
}
