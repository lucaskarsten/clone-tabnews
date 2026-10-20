import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import session from "models/session.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const renewedSession = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSession.token, response);

  // eslint-disable-next-line no-unused-vars
  const { password, ...userFound } = await user.findOneById(
    sessionObject.user_id,
  );

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return response.status(200).json(userFound);
}
