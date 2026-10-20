import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const validToken = await activation.findOneValidById(request.query.token_id);
  await activation.activateUserByUserId(validToken.user_id);
  const usedToken = await activation.markTokenAsUsed(validToken.id);

  return response
    .status(200)
    .json(
      authorization.filterOutput(
        request.context.user,
        "read:activation_token",
        usedToken,
      ),
    );
}
