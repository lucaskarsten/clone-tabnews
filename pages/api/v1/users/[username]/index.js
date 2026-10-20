import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...userFound } = await user.findOneByUsername(
    request.query.username,
  );
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...updatedUser } = await user.update(
    request.query.username,
    request.body,
  );
  return response.status(200).json(updatedUser);
}
