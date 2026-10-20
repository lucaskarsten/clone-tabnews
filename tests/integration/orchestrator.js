import retry from "async-retry";
import database from "infra/database.js";
import { faker } from "@faker-js/faker";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
import activation from "models/activation.js";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForEmailServer() {
    return retry(
      async () => {
        const response = await fetch(emailHttpUrl);
        if (response.status !== 200) {
          throw new Error("Servidor de email ainda não está pronto.");
        }
      },
      { retries: 100, maxTimeout: 1000 },
    );
  }

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error("Servidor web ainda não está pronto.");
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject = {}) {
  return user.create({
    // username limitado a 30 caracteres e sem caracteres especiais
    username:
      userObject.username ||
      faker.internet.username().replace(/[_.-]/g, "").slice(0, 30),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "senhaValida123",
  });
}

async function activateUser(userObject) {
  return activation.activateUserByUserId(userObject.id);
}

async function addFeaturesToUser(userObject, features) {
  const current = await user.findOneById(userObject.id);
  return user.setFeatures(userObject.id, [...current.features, ...features]);
}

async function createSession(userId) {
  return session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, { method: "DELETE" });
}

async function getLastEmail() {
  const messagesResponse = await fetch(`${emailHttpUrl}/messages`);
  const messages = await messagesResponse.json();
  const lastMessage = messages.at(-1);
  if (!lastMessage) return null;

  const textResponse = await fetch(
    `${emailHttpUrl}/messages/${lastMessage.id}.plain`,
  );
  lastMessage.text = await textResponse.text();
  return lastMessage;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  activateUser,
  addFeaturesToUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
