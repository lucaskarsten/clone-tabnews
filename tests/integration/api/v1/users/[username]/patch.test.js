import orchestrator from "tests/integration/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

async function createLoggedUser(userObject) {
  const createdUser = await orchestrator.createUser(userObject);
  const activatedUser = await orchestrator.activateUser(createdUser);
  const createdSession = await orchestrator.createSession(createdUser.id);
  return { user: activatedUser, token: createdSession.token };
}

async function patchUser(username, body, token) {
  return fetch(`http://localhost:3000/api/v1/users/${username}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `session_id=${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/v1/users/[username]", () => {
  describe("Usuário anônimo", () => {
    test("Retorna 403", async () => {
      const createdUser = await orchestrator.createUser();
      const response = await patchUser(createdUser.username, {
        username: "anonimo",
      });
      expect(response.status).toBe(403);
      expect((await response.json()).action).toBe(
        'Verifique se o seu usuário possui a feature "update:user".',
      );
    });
  });

  describe("Usuário padrão", () => {
    test("Com username inexistente", async () => {
      const { token } = await createLoggedUser();
      const response = await patchUser("naoexiste", { username: "x" }, token);
      expect(response.status).toBe(404);
    });

    test("Em outro usuário", async () => {
      const { token } = await createLoggedUser();
      const otherUser = await orchestrator.createUser();

      const response = await patchUser(
        otherUser.username,
        { username: "invasao" },
        token,
      );
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para atualizar outro usuário.",
        action:
          'Verifique se você possui a feature necessária para atualizar outro usuário ("update:user:others").',
        status_code: 403,
      });
    });

    test("Com username duplicado", async () => {
      await orchestrator.createUser({ username: "user1" });
      const { token } = await createLoggedUser({ username: "user2" });

      const response = await patchUser("user2", { username: "User1" }, token);
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        "O username informado já está sendo utilizado.",
      );
    });

    test("Com email duplicado", async () => {
      await orchestrator.createUser({ email: "email1@exemplo.com" });
      const { user: loggedUser, token } = await createLoggedUser();

      const response = await patchUser(
        loggedUser.username,
        { email: "Email1@exemplo.com" },
        token,
      );
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        "O email informado já está sendo utilizado.",
      );
    });

    test("Com username único", async () => {
      const { user: loggedUser, token } = await createLoggedUser({
        username: "unico1",
      });

      const response = await patchUser("unico1", { username: "unico2" }, token);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: loggedUser.id,
        username: "unico2",
        email: loggedUser.email,
        features: ["create:session", "read:session", "update:user"],
        created_at: loggedUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });
      expect(new Date(responseBody.updated_at) > loggedUser.updated_at).toBe(
        true,
      );
    });

    test("Mudando só a caixa do próprio username", async () => {
      const { token } = await createLoggedUser({ username: "caixa" });

      const response = await patchUser("caixa", { username: "Caixa" }, token);
      expect(response.status).toBe(200);
      expect((await response.json()).username).toBe("Caixa");
    });

    test("Com nova senha", async () => {
      const { token } = await createLoggedUser({
        username: "novasenha",
        password: "senha123",
      });

      const response = await patchUser(
        "novasenha",
        { password: "outraSenha" },
        token,
      );
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

  describe("Usuário privilegiado", () => {
    test("Com update:user:others altera outro usuário", async () => {
      const { user: privilegedUser, token } = await createLoggedUser();
      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);
      const otherUser = await orchestrator.createUser();

      const response = await patchUser(
        otherUser.username,
        { username: "alteradopeloadmin" },
        token,
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.username).toBe("alteradopeloadmin");
      expect(responseBody.email).toBeUndefined();
    });
  });
});
