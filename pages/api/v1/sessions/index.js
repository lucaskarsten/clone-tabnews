import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import { ForbiddenError } from "infra/errors.js";
import authentication from "models/authentication.js";
import authorization from "models/authorization.js";
import session from "models/session.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(controller.canRequest("read:session"), deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    email,
    password,
  );

  // Conta ainda não ativada não tem "create:session".
  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para fazer login.",
      action: "Ative sua conta pelo link enviado ao seu email.",
    });
  }

  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, response);

  return response
    .status(201)
    .json(
      authorization.filterOutput(authenticatedUser, "read:session", newSession),
    );
}

async function deleteHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);

  return response
    .status(200)
    .json(
      authorization.filterOutput(
        request.context.user,
        "read:session",
        expiredSession,
      ),
    );
}
