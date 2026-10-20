import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Usuário anônimo", () => {
    test("Retorna 403", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação.",
        action: 'Verifique se o seu usuário possui a feature "read:migration".',
        status_code: 403,
      });
    });
  });

  describe("Usuário padrão", () => {
    test("Retorna 403", async () => {
      const defaultUser = await orchestrator.createUser();
      await orchestrator.activateUser(defaultUser);
      const defaultSession = await orchestrator.createSession(defaultUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: { Cookie: `session_id=${defaultSession.token}` },
      });
      expect(response.status).toBe(403);
    });
  });

  describe("Usuário privilegiado", () => {
    test("Lista migrations pendentes", async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, ["read:migration"]);
      const privilegedSession = await orchestrator.createSession(
        privilegedUser.id,
      );

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: { Cookie: `session_id=${privilegedSession.token}` },
      });
      expect(response.status).toBe(200);

      // Todas já rodaram no beforeAll, então nada fica pendente.
      expect(await response.json()).toEqual([]);
    });
  });
});
