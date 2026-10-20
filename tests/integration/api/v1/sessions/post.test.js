import orchestrator from "tests/integration/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function postSession(body) {
  return fetch("http://localhost:3000/api/v1/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const authenticationError = {
  name: "UnauthorizedError",
  message: "Dados de autenticação não conferem.",
  action: "Verifique se os dados enviados estão corretos.",
  status_code: 401,
};

describe("POST /api/v1/sessions", () => {
  describe("Usuário anônimo", () => {
    test("Com email incorreto e senha correta", async () => {
      await orchestrator.createUser({ password: "senha-correta" });

      const response = await postSession({
        email: "email.errado@exemplo.com",
        password: "senha-correta",
      });
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(authenticationError);
    });

    test("Com email correto e senha incorreta", async () => {
      const createdUser = await orchestrator.createUser({
        password: "senha-correta",
      });

      const response = await postSession({
        email: createdUser.email,
        password: "senha-errada",
      });
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(authenticationError);
    });

    test("Com email e senha corretos", async () => {
      const createdUser = await orchestrator.createUser({
        email: "tudo.certo@exemplo.com",
        password: "tudo-certo",
      });

      const response = await postSession({
        email: "Tudo.Certo@exemplo.com",
        password: "tudo-certo",
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(responseBody.token).toMatch(/^[0-9a-f]{96}$/);

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);
      const diff = expiresAt - createdAt - session.EXPIRATION_IN_MILLISECONDS;
      expect(Math.abs(diff)).toBeLessThan(5000);

      const setCookie = response.headers.get("set-cookie");
      expect(setCookie).toContain(`session_id=${responseBody.token}`);
      expect(setCookie).toContain(
        `Max-Age=${session.EXPIRATION_IN_MILLISECONDS / 1000}`,
      );
      expect(setCookie).toContain("Path=/");
      expect(setCookie).toContain("HttpOnly");
    });
  });
});
