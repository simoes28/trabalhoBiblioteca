// Classe personalizada para erros da aplicação
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware para capturar erros assíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware principal de tratamento de erros
const globalErrorHandler = async (error, req, res, next) => {
  // Evita tratar erro novamente se resposta já foi enviada
  if (res.headersSent) {
    return next(error);
  }

  const errorTimestamp = new Date().toISOString();

  // Log detalhado (mais discreto em produção)
  const logInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: errorTimestamp,
    url: req?.originalUrl,
    method: req?.method,
    body: req?.body,
    headers: req?.headers,
    statusCode: error.statusCode || 500,
  };

  if (process.env.NODE_ENV === "development") {
    console.error("🚨 ERRO CAPTURADO:", logInfo);
  } else {
    console.error(`❌ [${errorTimestamp}] ERRO:`, error.message);
  }

  // Defaults
  let statusCode = error.statusCode || 500;
  let message = error.message || "Erro interno do servidor";
  let isOperational = error.isOperational ?? false;

  // Tratamentos específicos por código/nome
  switch (error.code) {
    case "ER_ACCESS_DENIED_ERROR":
      statusCode = 500;
      message = "Erro de acesso ao banco de dados";
      isOperational = false;
      break;
    case "ER_NO_SUCH_TABLE":
      statusCode = 500;
      message = "Erro de estrutura do banco de dados";
      isOperational = false;
      break;
    case "ECONNREFUSED":
      statusCode = 503;
      message = "Serviço temporariamente indisponível";
      isOperational = true;
      break;
    case "ETIMEDOUT":
      statusCode = 408;
      message = "Timeout na requisição";
      isOperational = true;
      break;
  }

  switch (error.name) {
    case "ValidationError":
      statusCode = 400;
      message = "Dados inválidos fornecidos";
      isOperational = true;
      break;
    case "JsonWebTokenError":
      statusCode = 401;
      message = "Token inválido";
      isOperational = true;
      break;
    case "UnauthorizedError":
      statusCode = 401;
      message = "Token não autorizado";
      isOperational = true;
      break;
  }

  // Resposta segura para o cliente
  const responseError = {
    success: false,
    error: {
      message: statusCode >= 500 && !isOperational
        ? "Erro interno do servidor"
        : message,
      timestamp: errorTimestamp,
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        originalMessage: error.message,
      }),
    },
  };

  res.status(statusCode).json(responseError);
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Rota ${req.originalUrl} não encontrada`, 404);
  next(error);
};

// Handlers para erros não capturados do processo
const setupProcessErrorHandlers = () => {
  // Erros não capturados (exceções)
  process.on("uncaughtException", async (error) => {
    console.error("🚨 UNCAUGHT EXCEPTION:", error);
    process.exit(1); // Encerra aplicação
  });

  // Promises rejeitadas não tratadas
  process.on("unhandledRejection", async (reason, promise) => {
    console.error("🚨 UNHANDLED REJECTION:", reason);
    process.exit(1);
  });

  // Finalização suave
  process.on("SIGTERM", () => {
    console.log("🔄 SIGTERM recebido. Encerrando...");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("🔄 SIGINT (Ctrl+C) recebido. Encerrando...");
    process.exit(0);
  });
};

module.exports = {
  AppError,
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  setupProcessErrorHandlers,
};