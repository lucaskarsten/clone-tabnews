import orchestrator from "tests/integration/orchestrator.js";

let createdUser;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  createdUser = await orchestrator.createUser({ username: "MesmoCase" });
});

describe("GET /api/v1/users/[username]", () => {
  describe("Usuário anônimo", () => {
    test("Com username exato", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "MesmoCase",
        features: ["read:activation_token"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });
    });

    test("Com caixa diferente", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/mesmocase",
      );
      expect(response.status).toBe(200);
      expect((await response.json()).username).toBe("MesmoCase");
    });

    test("Com username inexistente", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/naoexiste",
      );
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });
  });

  describe("Usuário padrão", () => {
    test("Vê o próprio email, mas não o dos outros", async () => {
      const defaultUser = await orchestrator.createUser();
      await orchestrator.activateUser(defaultUser);
      const defaultSession = await orchestrator.createSession(defaultUser.id);
      const headers = { Cookie: `session_id=${defaultSession.token}` };

      const ownResponse = await fetch(
        `http://localhost:3000/api/v1/users/${defaultUser.username}`,
        { headers },
      );
      expect((await ownResponse.json()).email).toBe(defaultUser.email);

      const otherResponse = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
        { headers },
      );
      expect((await otherResponse.json()).email).toBeUndefined();
    });
  });
});
