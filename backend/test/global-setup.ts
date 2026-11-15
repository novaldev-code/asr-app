import "dotenv/config";
import { fileURLToPath } from "node:url";

const TABLES = [
  "order_status_history",
  "order_items",
  "orders",
  "cart_items",
  "carts",
  "addresses",
  "shipping_rates",
  "products",
  "categories",
  "sessions",
  "accounts",
  "verifications",
  "users",
];

export default async function setup(): Promise<void> {
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  process.env.NODE_ENV = "test";

  const [{ createDatabase }, { migrate }] = await Promise.all([
    import("../src/db/client.js"),
    import("drizzle-orm/node-postgres/migrator"),
  ]);

  const { db, pool } = createDatabase(process.env.DATABASE_URL ?? "");
  try {
    await migrate(db, {
      migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
    });
    await pool.query(
      `TRUNCATE TABLE ${TABLES.join(", ")} RESTART IDENTITY CASCADE`,
    );
  } finally {
    await pool.end();
  }
}
