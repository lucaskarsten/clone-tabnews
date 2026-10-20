import bcryptjs from "bcryptjs";

function getNumberOfRounds() {
  // 1 round fora de produção para os testes não esperarem o bcrypt.
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function addPepper(password) {
  return password + process.env.PEPPER;
}

async function hash(password) {
  return bcryptjs.hash(addPepper(password), getNumberOfRounds());
}

async function compare(providedPassword, storedPassword) {
  return bcryptjs.compare(addPepper(providedPassword), storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
