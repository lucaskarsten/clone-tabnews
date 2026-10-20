import database from "infra/database.js";
import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Usuário anônimo", () => {
    test("Retorna 403", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
      });
      expect(response.status).toBe(403);
    });
  });

  describe("Usuário privilegiado", () => {
    test("Roda migrations pendentes uma única vez", async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, [
        "create:migration",
      ]);
      const privilegedSession = await orchestrator.createSession(
        privilegedUser.id,
      );

      // Desfaz a última migration para ela voltar a ficar pendente sem
      // apagar as tabelas de usuários e sessões que o teste precisa.
      await database.query(
        "DELETE FROM pgmigrations WHERE id = (SELECT MAX(id) FROM pgmigrations);",
      );
      await database.query("DROP TABLE user_activation_tokens;");

      const postMigrations = () =>
        fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
          headers: { Cookie: `session_id=${privilegedSession.token}` },
        });

      const response1 = await postMigrations();
      expect(response1.status).toBe(201);
      expect((await response1.json()).length).toBe(1);

      const response2 = await postMigrations();
      expect(response2.status).toBe(200);
      expect(await response2.json()).toEqual([]);
    });
  });
});
