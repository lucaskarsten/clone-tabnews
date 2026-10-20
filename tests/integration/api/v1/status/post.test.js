import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  test("Retorna 405 com erro padronizado", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status", {
      method: "POST",
    });
    expect(response.status).toBe(405);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      name: "MethodNotAllowedError",
      message: "Método não permitido para este endpoint.",
      action: "Verifique se o método HTTP enviado é válido para este endpoint.",
      status_code: 405,
    });
  });
});
