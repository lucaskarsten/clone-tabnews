import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import { ForbiddenError } from "infra/errors.js";
import user from "models/user.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userFound = await user.findOneByUsername(request.query.username);
  return response
    .status(200)
    .json(
      authorization.filterOutput(request.context.user, "read:user", userFound),
    );
}

async function patchHandler(request, response) {
  const requester = request.context.user;
  const targetUser = await user.findOneByUsername(request.query.username);

  if (!authorization.can(requester, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para atualizar outro usuário.",
      action:
        'Verifique se você possui a feature necessária para atualizar outro usuário ("update:user:others").',
    });
  }

  const updatedUser = await user.update(request.query.username, request.body);
  return response
    .status(200)
    .json(authorization.filterOutput(requester, "read:user", updatedUser));
}
