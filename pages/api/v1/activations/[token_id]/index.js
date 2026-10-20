import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const validToken = await activation.findOneValidById(request.query.token_id);
  await activation.activateUserByUserId(validToken.user_id);
  const usedToken = await activation.markTokenAsUsed(validToken.id);

  return response.status(200).json(usedToken);
}
