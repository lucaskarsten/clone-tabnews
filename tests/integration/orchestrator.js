import retry from "async-retry";

async function waitForAllServices() {
  // ensure tests always target the local postgres container regardless of
  // any PGHOST/PG* variables exported in the environment by the user
  // (e.g. when experimenting with production credentials).
  process.env.PGHOST = "localhost";
  process.env.PGPORT = process.env.PGPORT || "5432";
  process.env.PGUSER = process.env.PGUSER || "local_user";
  process.env.PGDATABASE = process.env.PGDATABASE || "local_db";
  process.env.PGPASSWORD = process.env.PGPASSWORD || "local_password";
  // SSL should be disabled for the dockerized dev database
  process.env.PGSSLMODE = "disable";

  await waitForWebServer();

  async function waitForWebServer() {
    // ensure the server has had time to start and build static files
    // `next start` already produces a complete build, but when using
    // `next dev` we may need a short delay. retrying the status endpoint
    // inherently waits for compilation.
    return retry(fethStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fethStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error("Web server is not ready yet");
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
