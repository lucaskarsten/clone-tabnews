import orchestrator from "tests/integration/orchestrator.js";
import activation from "models/activation.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

async function patchActivation(tokenId) {
  return fetch(`http://localhost:3000/api/v1/activations/${tokenId}`, {
    method: "PATCH",
  });
}

const notFoundBody = {
  name: "NotFoundError",
  message:
    "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
  action: "Faça um novo cadastro.",
  status_code: 404,
};

describe("PATCH /api/v1/activations/[token_id]", () => {
  describe("Usuário anônimo", () => {
    test("Fluxo completo: cadastro, email e ativação", async () => {
      const createResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "ativacao",
          email: "ativacao@exemplo.com",
          password: "senha123",
        }),
      });
      expect(createResponse.status).toBe(201);
      const createdUser = await createResponse.json();
      expect(createdUser.features).toEqual(["read:activation_token"]);

      const lastEmail = await orchestrator.getLastEmail();
      expect(lastEmail.recipients[0]).toBe("<ativacao@exemplo.com>");
      expect(lastEmail.subject).toBe("Ative seu cadastro no CloneTabNews!");

      const tokenId = lastEmail.text.match(
        /\/cadastro\/ativar\/([0-9a-f-]+)/,
      )[1];
      expect(lastEmail.text).toContain(
        activation.getActivationPageUrl(tokenId),
      );

      const tokenInDatabase = await activation.findOneValidById(tokenId);
      expect(tokenInDatabase.user_id).toBe(createdUser.id);

      const response = await patchActivation(tokenId);
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.id).toBe(tokenId);
      expect(Date.parse(responseBody.used_at)).not.toBeNaN();

      const activatedUser = await user.findOneById(createdUser.id);
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
        "update:user",
      ]);

      const secondResponse = await patchActivation(tokenId);
      expect(secondResponse.status).toBe(404);
      expect(await secondResponse.json()).toEqual(notFoundBody);
    });

    test("Com token inexistente", async () => {
      const response = await patchActivation(
        "4b1f4e2a-1c1e-4e7a-9c1a-0d6b2f1c9e11",
      );
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual(notFoundBody);
    });

    test("Com token em formato inválido", async () => {
      const response = await patchActivation("nao-e-uuid");
      expect(response.status).toBe(404);
    });

    test("Com token expirado", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS),
        doNotFake: ["nextTick", "setImmediate", "setTimeout"],
      });
      const createdUser = await orchestrator.createUser();
      const expiredToken = await activation.create(createdUser.id);
      jest.useRealTimers();

      const response = await patchActivation(expiredToken.id);
      expect(response.status).toBe(404);
    });
  });

  describe("Usuário padrão", () => {
    test("Já ativado não pode usar token de ativação", async () => {
      const createdUser = await orchestrator.createUser();
      const pendingToken = await activation.create(createdUser.id);
      await orchestrator.activateUser(createdUser);
      const userSession = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/activations/${pendingToken.id}`,
        {
          method: "PATCH",
          headers: { Cookie: `session_id=${userSession.token}` },
        },
      );
      expect(response.status).toBe(403);
    });
  });
});
