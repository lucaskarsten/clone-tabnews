import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "MesmoCase",
      email: "mesmo.case@exemplo.com",
      password: "senha123",
    }),
  });
});

describe("GET /api/v1/users/[username]", () => {
  describe("Usuário anônimo", () => {
    test("Com username exato", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.username).toBe("MesmoCase");
      expect(responseBody.password).toBeUndefined();
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
});
