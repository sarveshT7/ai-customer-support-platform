import * as path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { FileMigrationProvider, Migrator } from "kysely";
import { closeDb, db } from "./kysely/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),
  }),
});

async function migrateToLatest() {
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (!results?.length && !error) {
    console.log("No pending migrations.");
  }

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    await closeDb();
    process.exit(1);
  }

  await closeDb();
}

migrateToLatest();
