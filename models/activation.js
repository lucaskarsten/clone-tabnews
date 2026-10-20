import database from "infra/database.js";
import email from "infra/email.js";
import { NotFoundError } from "infra/errors.js";
import user from "models/user.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutos

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const results = await database.query({
    text: `
      INSERT INTO user_activation_tokens (user_id, expires_at)
      VALUES ($1, $2)
      RETURNING *;`,
    values: [userId, expiresAt],
  });

  return results.rows[0];
}

async function sendEmailToUser(userObject, activationToken) {
  await email.send({
    from: "CloneTabNews <contato@clonetabnews.com.br>",
    to: userObject.email,
    subject: "Ative seu cadastro no CloneTabNews!",
    text: `${userObject.username}, clique no link abaixo para ativar seu cadastro no CloneTabNews:

${getActivationPageUrl(activationToken.id)}

Atenciosamente,
Equipe CloneTabNews`,
  });
}

function getActivationPageUrl(tokenId) {
  return `${process.env.WEBSERVER_URL}/cadastro/ativar/${tokenId}`;
}

async function findOneValidById(tokenId) {
  const notFound = new NotFoundError({
    message:
      "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
    action: "Faça um novo cadastro.",
  });

  // Id fora do formato uuid faria o Postgres lançar erro de sintaxe (500).
  if (!UUID_PATTERN.test(tokenId)) throw notFound;

  const results = await database.query({
    text: `
      SELECT * FROM user_activation_tokens
      WHERE id = $1 AND used_at IS NULL AND expires_at > NOW()
      LIMIT 1;`,
    values: [tokenId],
  });

  if (results.rowCount === 0) throw notFound;

  return results.rows[0];
}

async function markTokenAsUsed(tokenId) {
  const results = await database.query({
    text: `
      UPDATE user_activation_tokens
      SET used_at = timezone('utc', now()), updated_at = timezone('utc', now())
      WHERE id = $1
      RETURNING *;`,
    values: [tokenId],
  });

  return results.rows[0];
}

async function activateUserByUserId(userId) {
  return user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
}

const activation = {
  create,
  sendEmailToUser,
  getActivationPageUrl,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
