import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "infra/errors.js";
import session from "models/session.js";
import user from "models/user.js";
import authorization from "models/authorization.js";

const knownErrors = [
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
];

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  // Sessão inválida no cookie: limpa para o navegador não reenviar.
  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
  }

  if (knownErrors.some((ErrorClass) => error instanceof ErrorClass)) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function writeSessionCookie(value, maxAgeInSeconds, response) {
  const attributes = [
    `session_id=${value}`,
    "Path=/",
    `Max-Age=${maxAgeInSeconds}`,
    "HttpOnly",
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  response.setHeader("Set-Cookie", attributes.join("; "));
}

function setSessionCookie(sessionToken, response) {
  writeSessionCookie(
    sessionToken,
    session.EXPIRATION_IN_MILLISECONDS / 1000,
    response,
  );
}

function clearSessionCookie(response) {
  writeSessionCookie("invalid", -1, response);
}

async function injectAnonymousOrUser(request, response, next) {
  const sessionToken = request.cookies.session_id;

  if (!sessionToken) {
    request.context = {
      ...request.context,
      user: { features: authorization.ANONYMOUS_FEATURES },
    };
    return next();
  }

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userObject = await user.findOneById(sessionObject.user_id);
  request.context = { ...request.context, user: userObject };
  return next();
}

function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    if (!authorization.can(request.context.user, feature)) {
      throw new ForbiddenError({
        message: "Você não possui permissão para executar esta ação.",
        action: `Verifique se o seu usuário possui a feature "${feature}".`,
      });
    }
    return next();
  };
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  injectAnonymousOrUser,
  canRequest,
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
