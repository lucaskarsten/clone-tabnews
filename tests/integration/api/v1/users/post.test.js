import orchestrator from "tests/integration/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function postUser(body) {
  return fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/users", () => {
  describe("Usuário anônimo", () => {
    test("Com dados únicos e válidos", async () => {
      const response = await postUser({
        username: "lucaskarsten",
        email: "lucas@exemplo.com",
        password: "senha123",
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "lucaskarsten",
        email: "lucas@exemplo.com",
        features: [],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("lucaskarsten");
      expect(userInDatabase.password).not.toBe("senha123");
      expect(await password.compare("senha123", userInDatabase.password)).toBe(
        true,
      );
      expect(
        await password.compare("senhaErrada", userInDatabase.password),
      ).toBe(false);
    });

    test("Com email duplicado (caixa diferente)", async () => {
      const response = await postUser({
        username: "outrousuario",
        email: "Lucas@Exemplo.com",
        password: "senha123",
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("Com username duplicado (caixa diferente)", async () => {
      const response = await postUser({
        username: "LucasKarsten",
        email: "outro@exemplo.com",
        password: "senha123",
      });
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        "O username informado já está sendo utilizado.",
      );
    });

    test("Sem senha", async () => {
      const response = await postUser({
        username: "semsenha",
        email: "semsenha@exemplo.com",
      });
      expect(response.status).toBe(400);
      expect((await response.json()).name).toBe("ValidationError");
    });
  });
});
