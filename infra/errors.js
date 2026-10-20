class BaseError extends Error {
  constructor(message, { cause, action, statusCode }) {
    super(message, { cause });
    this.action = action;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor({ cause, statusCode } = {}) {
    super("Um erro interno não esperado aconteceu.", {
      cause,
      action: "Entre em contato com o suporte.",
      statusCode: statusCode || 500,
    });
    this.name = "InternalServerError";
  }
}

export class ServiceError extends BaseError {
  constructor({ cause, message } = {}) {
    super(message || "Serviço indisponível no momento.", {
      cause,
      action: "Verifique se o serviço está disponível.",
      statusCode: 503,
    });
    this.name = "ServiceError";
  }
}

export class ValidationError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Um erro de validação ocorreu.", {
      cause,
      action: action || "Ajuste os dados enviados e tente novamente.",
      statusCode: 400,
    });
    this.name = "ValidationError";
  }
}

export class NotFoundError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Não foi possível encontrar este recurso no sistema.", {
      cause,
      action: action || "Verifique se os parâmetros da consulta estão certos.",
      statusCode: 404,
    });
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Usuário não autenticado.", {
      cause,
      action: action || "Faça novamente o login para continuar.",
      statusCode: 401,
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends BaseError {
  constructor({ cause, message, action } = {}) {
    super(message || "Você não possui permissão para executar esta ação.", {
      cause,
      action:
        action || "Verifique se você possui permissão para executar esta ação.",
      statusCode: 403,
    });
    this.name = "ForbiddenError";
  }
}

export class MethodNotAllowedError extends BaseError {
  constructor() {
    super("Método não permitido para este endpoint.", {
      action: "Verifique se o método HTTP enviado é válido para este endpoint.",
      statusCode: 405,
    });
    this.name = "MethodNotAllowedError";
  }
}
