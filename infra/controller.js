import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "infra/errors.js";
import session from "models/session.js";

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

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
