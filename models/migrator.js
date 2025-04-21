import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
      dbClient,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigration() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient,
    });
    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}
const migrator = {
  listPendingMigrations,
  runPendingMigration,
};

export default migrator;
