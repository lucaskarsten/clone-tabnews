import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authorization from "models/authorization.js";
import session from "models/session.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionObject = await session.findOneValidByToken(
    request.cookies.session_id,
  );
  const renewedSession = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSession.token, response);

  const userFound = request.context.user;

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  return response
    .status(200)
    .json(authorization.filterOutput(userFound, "read:user", userFound));
}
