import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    email,
    password,
  );

  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}
