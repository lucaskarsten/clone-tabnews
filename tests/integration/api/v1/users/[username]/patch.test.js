import orchestrator from "tests/integration/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function postUser(body) {
  const response = await fetch("http://localhost:3000/api/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "senha123", ...body }),
  });
  return response.json();
}

async function patchUser(username, body) {
  return fetch(`http://localhost:3000/api/v1/users/${username}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/v1/users/[username]", () => {
  describe("Usuário anônimo", () => {
    test("Com username inexistente", async () => {
      const response = await patchUser("naoexiste", { username: "x" });
      expect(response.status).toBe(404);
    });

    test("Com username duplicado", async () => {
      await postUser({ username: "user1", email: "user1@exemplo.com" });
      await postUser({ username: "user2", email: "user2@exemplo.com" });

      const response = await patchUser("user2", { username: "User1" });
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        "O username informado já está sendo utilizado.",
      );
    });

    test("Com email duplicado", async () => {
      await postUser({ username: "email1", email: "email1@exemplo.com" });
      await postUser({ username: "email2", email: "email2@exemplo.com" });

      const response = await patchUser("email2", {
        email: "Email1@exemplo.com",
      });
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        "O email informado já está sendo utilizado.",
      );
    });

    test("Com username único", async () => {
      const created = await postUser({
        username: "unico1",
        email: "unico1@exemplo.com",
      });

      const response = await patchUser("unico1", { username: "unico2" });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.username).toBe("unico2");
      expect(responseBody.password).toBeUndefined();
      expect(responseBody.updated_at > created.updated_at).toBe(true);
    });

    test("Mudando só a caixa do próprio username", async () => {
      await postUser({ username: "caixa", email: "caixa@exemplo.com" });

      const response = await patchUser("caixa", { username: "Caixa" });
      expect(response.status).toBe(200);
      expect((await response.json()).username).toBe("Caixa");
    });

    test("Com nova senha", async () => {
      await postUser({ username: "novasenha", email: "novasenha@exemplo.com" });

      const response = await patchUser("novasenha", { password: "outraSenha" });
      expect(response.status).toBe(200);

      const userInDatabase = await user.findOneByUsername("novasenha");
      expect(
        await password.compare("outraSenha", userInDatabase.password),
      ).toBe(true);
      expect(await password.compare("senha123", userInDatabase.password)).toBe(
        false,
      );
    });
  });
});
