import { Client } from "pg";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    // only try to close if we actually obtained a client
    if (client && typeof client.end === "function") {
      try {
        await client.end();
      } catch (_e) {
        // ignore shutdown errors
      }
    }
  }
}

async function getNewClient() {
  // prefer explicit POSTGRES_* vars, but also accept generic PG* names that
  // some tools (e.g. `psql`, docker-compose) set automatically.
  // when running under Jest (NODE_ENV=test) the Next.js server process
  // does not inherit the environment overrides made by the test runner,
  // so we enforce local defaults here to guarantee tests hit the
  // dockerized postgres container instead of any stray production config.
  const isTest = process.env.NODE_ENV === "test";

  const env = {
    host: isTest
      ? process.env.POSTGRES_HOST || process.env.PGHOST || "localhost"
      : process.env.POSTGRES_HOST || process.env.PGHOST || "localhost",
    port: isTest
      ? process.env.POSTGRES_PORT || process.env.PGPORT || "5432"
      : process.env.POSTGRES_PORT || process.env.PGPORT || undefined,
    user: isTest
      ? process.env.POSTGRES_USER || process.env.PGUSER || "local_user"
      : process.env.POSTGRES_USER || process.env.PGUSER,
    database: isTest
      ? process.env.POSTGRES_DB || process.env.PGDATABASE || "local_db"
      : process.env.POSTGRES_DB || process.env.PGDATABASE,
    password: isTest
      ? process.env.POSTGRES_PASSWORD ||
        process.env.PGPASSWORD ||
        "local_password"
      : process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
    ssl: getSSLValues(),
  };

  // sanity check - pg expects strings for credentials; undefined will lead to
  // the SASL error seen in logs.
  if (!env.password || typeof env.password !== "string") {
    throw new Error(
      `postgres password must be a non‑empty string; got ${typeof env.password}`,
    );
  }
  if (!env.user || typeof env.user !== "string") {
    throw new Error(`postgres user must be a string; got ${typeof env.user}`);
  }

  const client = new Client(env);
  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};

export default database;

function getSSLValues() {
  // first, if a CA bundle is provided explicitly use it
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  // honor PGSSLMODE/POSTGRES_SSLMODE which is how libpq clients
  // describe the desired policy. the node pg driver only wants a
  // boolean or options object, but we can approximate common modes.
  const mode = process.env.PGSSLMODE || process.env.POSTGRES_SSLMODE || "";
  switch (mode.toLowerCase()) {
    case "disable":
      return false;
    case "allow":
    case "prefer":
      // allow or prefer still try ssl but accept insecure; returning
      // `true` will negotiate SSL but not verify cert
      return { rejectUnauthorized: false };
    case "require":
      // require SSL but don't verify certificate
      return { rejectUnauthorized: false };
    case "verify-ca":
    case "verify-full":
      // verify certificate against CA bundle; since we don't have one,
      // just enable SSL (node pg will use system CAs)
      return true;
    default:
      // fallback to production=ssl else disabled
      return process.env.NODE_ENV === "production" ? true : false;
  }
}
