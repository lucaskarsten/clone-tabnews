import database from "infra/database.js";
import { NotFoundError, ValidationError } from "infra/errors.js";
import password from "models/password.js";

async function findOneById(id) {
  const results = await database.query({
    text: "SELECT * FROM users WHERE id = $1 LIMIT 1;",
    values: [id],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O id informado não foi encontrado no sistema.",
      action: "Verifique se o id está digitado corretamente.",
    });
  }

  return results.rows[0];
}

async function findOneByUsername(username) {
  const results = await database.query({
    text: "SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;",
    values: [username],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
    });
  }

  return results.rows[0];
}

async function findOneByEmail(email) {
  const results = await database.query({
    text: "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;",
    values: [email],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O email informado não foi encontrado no sistema.",
      action: "Verifique se o email está digitado corretamente.",
    });
  }

  return results.rows[0];
}

async function create(userInputValues) {
  validateRequiredFields(userInputValues, ["username", "email", "password"]);
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  const hashedPassword = await password.hash(userInputValues.password);

  const results = await database.query({
    text: `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;`,
    values: [userInputValues.username, userInputValues.email, hashedPassword],
  });

  return results.rows[0];
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  validateRequiredFields(
    userInputValues,
    Object.keys(userInputValues).filter((key) =>
      ["username", "email", "password"].includes(key),
    ),
  );

  // Trocar só a caixa do próprio username/email não pode acusar duplicidade.
  if (
    "username" in userInputValues &&
    userInputValues.username.toLowerCase() !==
      currentUser.username.toLowerCase()
  ) {
    await validateUniqueUsername(userInputValues.username);
  }

  if (
    "email" in userInputValues &&
    userInputValues.email.toLowerCase() !== currentUser.email.toLowerCase()
  ) {
    await validateUniqueEmail(userInputValues.email);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  if ("password" in userInputValues) {
    userWithNewValues.password = await password.hash(userInputValues.password);
  }

  const results = await database.query({
    text: `
      UPDATE users
      SET username = $2, email = $3, password = $4,
        updated_at = timezone('utc', now())
      WHERE id = $1
      RETURNING *;`,
    values: [
      userWithNewValues.id,
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
    ],
  });

  return results.rows[0];
}

function validateRequiredFields(values, fields) {
  for (const field of fields) {
    if (typeof values[field] !== "string" || values[field].trim() === "") {
      throw new ValidationError({
        message: `O campo "${field}" é obrigatório.`,
        action: `Informe o campo "${field}" e tente novamente.`,
      });
    }
  }
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: "SELECT 1 FROM users WHERE LOWER(username) = LOWER($1);",
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1);",
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
