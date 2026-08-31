import { Kysely, sql } from "kysely";
import { PRODUCT_CATEGORIES } from "../../models/product.js";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("products")
    .addColumn("product_id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("category", "text", (col) =>
      col
        .notNull()
        .check(
          sql`category IN (${sql.join(
            PRODUCT_CATEGORIES.map((category) => sql.lit(category)),
          )})`,
        ),
    )
    .addColumn("brand", "text", (col) => col.notNull())
    .addColumn("price", "integer", (col) => col.notNull().check(sql`price >= 0`))
    .addColumn("stock", "integer", (col) => col.notNull().check(sql`stock >= 0`))
    .addColumn("rating", "real", (col) =>
      col.notNull().check(sql`rating >= 0 AND rating <= 5`),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();

  await db.schema
    .createIndex("idx_products_category")
    .on("products")
    .column("category")
    .execute();

  await db.schema
    .createIndex("idx_products_price")
    .on("products")
    .column("price")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("products").ifExists().execute();
}
