import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activation from "models/activation.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const newUser = await user.create(request.body);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  // O usuário recém-criado ainda é anônimo: ele não vê o próprio email aqui.
  return response
    .status(201)
    .json(
      authorization.filterOutput(request.context.user, "read:user", newUser),
    );
}
