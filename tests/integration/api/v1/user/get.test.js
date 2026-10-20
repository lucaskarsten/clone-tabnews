import orchestrator from "tests/integration/orchestrator.js";
import session from "models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function getUser(token) {
  return fetch("http://localhost:3000/api/v1/user", {
    headers: { Cookie: `session_id=${token}` },
  });
}

async function createActivatedUser(userObject) {
  const createdUser = await orchestrator.createUser(userObject);
  return orchestrator.activateUser(createdUser);
}

describe("GET /api/v1/user", () => {
  describe("Usuário anônimo", () => {
    test("Sem cookie de sessão", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user");
      expect(response.status).toBe(403);
    });
  });

  describe("Usuário padrão", () => {
    test("Com sessão válida", async () => {
      const createdUser = await createActivatedUser({
        username: "comsessaovalida",
      });
      const validSession = await orchestrator.createSession(createdUser.id);

      const response = await getUser(validSession.token);
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "comsessaovalida",
        email: createdUser.email,
        features: ["create:session", "read:session", "update:user"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      const renewedSession = await session.findOneValidByToken(
        validSession.token,
      );
      expect(renewedSession.expires_at > validSession.expires_at).toBe(true);
      expect(renewedSession.updated_at > validSession.updated_at).toBe(true);

      const setCookie = response.headers.get("set-cookie");
      expect(setCookie).toContain(`session_id=${validSession.token}`);
      expect(setCookie).toContain(
        `Max-Age=${session.EXPIRATION_IN_MILLISECONDS / 1000}`,
      );
    });

    test("Com sessão inexistente", async () => {
      const response = await getUser("token-que-nao-existe");
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("Com sessão expirada", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
        doNotFake: ["nextTick", "setImmediate", "setTimeout"],
      });
      const createdUser = await createActivatedUser();
      const expiredSession = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();

      const response = await getUser(expiredSession.token);
      expect(response.status).toBe(401);
    });
  });
});
