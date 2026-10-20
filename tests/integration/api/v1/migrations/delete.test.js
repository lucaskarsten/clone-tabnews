import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("DELETE /api/v1/migrations", () => {
  test("Retorna 405 com erro padronizado", async () => {
    const response = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "DELETE",
    });
    expect(response.status).toBe(405);

    const responseBody = await response.json();
    expect(responseBody.name).toBe("MethodNotAllowedError");
    expect(responseBody.status_code).toBe(405);
  });
});
