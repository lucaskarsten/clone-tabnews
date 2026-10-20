import { createRouter } from "next-connect";
import database from "infra/database";
import controller from "infra/controller.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersion = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;

  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  const statusObject = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: parseInt(databaseMaxConnectionsValue),
        open_connection: databaseOpenedConnectionsValue,
      },
    },
  };

  return response
    .status(200)
    .json(
      authorization.filterOutput(
        request.context.user,
        "read:status",
        statusObject,
      ),
    );
}
