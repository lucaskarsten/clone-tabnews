#!/usr/bin/env node
// quick helper to verify Postgres connectivity using the same code
// that the application uses. Useful when you want to "test direto em
// prod" by exporting a set of PGHOST/PGUSER/PGPASSWORD etc.

import database from "./database.js";

async function main() {
  try {
    console.log("trying to connect using env vars:", {
      host: process.env.POSTGRES_HOST || process.env.PGHOST,
      database: process.env.POSTGRES_DB || process.env.PGDATABASE,
      user: process.env.POSTGRES_USER || process.env.PGUSER,
      // don't log the password for obvious reasons
    });

    const result = await database.query("SELECT now() as now");
    console.log("connected, server time is", result.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error("connection failed:", err.message);
    process.exit(1);
  }
}

main();
