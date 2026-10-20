import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Usuário anônimo", () => {
    test("Recupera o status sem a versão do banco", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
      expect(responseBody.dependencies.database).toEqual({
        max_connections: 100,
        open_connection: 1,
      });
    });
  });

  describe("Usuário privilegiado", () => {
    test("Com read:status:all vê a versão do banco", async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, ["read:status:all"]);
      const privilegedSession = await orchestrator.createSession(
        privilegedUser.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: { Cookie: `session_id=${privilegedSession.token}` },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.dependencies.database.version).toBe("16.0");
      expect(responseBody.dependencies.database.max_connections).toBe(100);
    });
  });
});
