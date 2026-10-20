import orchestrator from "tests/integration/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function deleteSession(token) {
  return fetch("http://localhost:3000/api/v1/sessions", {
    method: "DELETE",
    headers: token ? { Cookie: `session_id=${token}` } : {},
  });
}

async function createActivatedUser() {
  const createdUser = await orchestrator.createUser();
  return orchestrator.activateUser(createdUser);
}

describe("DELETE /api/v1/sessions", () => {
  describe("Usuário anônimo", () => {
    test("Sem cookie de sessão", async () => {
      const response = await deleteSession();
      expect(response.status).toBe(403);
    });
  });

  describe("Usuário padrão", () => {
    test("Com sessão inexistente", async () => {
      const response = await deleteSession("token-que-nao-existe");
      expect(response.status).toBe(401);
      expect((await response.json()).message).toBe(
        "Usuário não possui sessão ativa.",
      );
      expect(response.headers.get("set-cookie")).toContain("Max-Age=-1");
    });

    test("Com sessão expirada", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
        doNotFake: ["nextTick", "setImmediate", "setTimeout"],
      });
      const createdUser = await createActivatedUser();
      const expiredSession = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();

      const response = await deleteSession(expiredSession.token);
      expect(response.status).toBe(401);
    });

    test("Com sessão válida", async () => {
      const createdUser = await createActivatedUser();
      const validSession = await orchestrator.createSession(createdUser.id);

      const response = await deleteSession(validSession.token);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.id).toBe(validSession.id);
      expect(new Date(responseBody.expires_at) < new Date()).toBe(true);
      expect(response.headers.get("set-cookie")).toContain(
        "session_id=invalid",
      );

      const userResponse = await fetch("http://localhost:3000/api/v1/user", {
        headers: { Cookie: `session_id=${validSession.token}` },
      });
      expect(userResponse.status).toBe(401);
    });
  });
});
