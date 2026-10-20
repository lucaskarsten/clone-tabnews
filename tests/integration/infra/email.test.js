import email from "infra/email.js";
import orchestrator from "tests/integration/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "CloneTabNews <contato@clonetabnews.com.br>",
      to: "destino@exemplo.com",
      subject: "Primeiro email",
      text: "Corpo do primeiro email.",
    });

    await email.send({
      from: "CloneTabNews <contato@clonetabnews.com.br>",
      to: "destino@exemplo.com",
      subject: "Último email",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@clonetabnews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<destino@exemplo.com>");
    expect(lastEmail.subject).toBe("Último email");
    expect(lastEmail.text.trim()).toBe("Corpo do último email.");
  });
});
