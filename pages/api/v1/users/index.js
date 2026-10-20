import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  // eslint-disable-next-line no-unused-vars
  const { password, ...newUser } = await user.create(request.body);
  return response.status(201).json(newUser);
}
