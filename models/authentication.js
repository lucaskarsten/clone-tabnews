import { NotFoundError, UnauthorizedError } from "infra/errors.js";
import password from "models/password.js";
import user from "models/user.js";

// Mesma mensagem para email inexistente e senha errada, para não revelar
// quais emails têm conta.
function authenticationFailed(cause) {
  return new UnauthorizedError({
    cause,
    message: "Dados de autenticação não conferem.",
    action: "Verifique se os dados enviados estão corretos.",
  });
}

async function getAuthenticatedUser(providedEmail, providedPassword) {
  let storedUser;
  try {
    storedUser = await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) throw authenticationFailed(error);
    throw error;
  }

  const passwordMatch = await password.compare(
    providedPassword,
    storedUser.password,
  );
  if (!passwordMatch) throw authenticationFailed();

  return storedUser;
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
