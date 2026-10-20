import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function run(options) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await migrationRunner({
      ...defaultMigrationOptions,
      ...options,
      dbClient,
    });
  } finally {
    await dbClient?.end();
  }
}

async function listPendingMigrations() {
  return run({ dryRun: true });
}

async function runPendingMigrations() {
  return run({ dryRun: false });
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
