require("dotenv").config();
const express = require("express");
const http = require("http");
const setupExpress = require("./config/express");
const setup = require("./setup")

// Importar sistema de tratamento de erros
const {
  globalErrorHandler,
  notFoundHandler,
  setupProcessErrorHandlers,
} = require("./middlewares/errorHandler");

//Declarando Rotas
const authorsRoute = require("./routes/authorsRoute");
const booksRoute = require("./routes/booksRoute");


// Configurar handlers de erro do processo
setupProcessErrorHandlers();

// Inicialização do express
const app = express();
const server = http.createServer(app);

// Configurações básicas do Express
setupExpress(app);

setup();

// Health check endpoint (importante para produção)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Rotas da aplicação
app.use("/api/authors", authorsRoute);
app.use("/api/books", booksRoute)

// Middleware para rotas não encontradas (deve vir ANTES do error handler)
app.use(notFoundHandler);

// Middleware global de tratamento de erros (deve ser o ÚLTIMO middleware)
app.use(globalErrorHandler);

// Função para inicializar servidor com tratamento de erro
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    });

    // Tratamento para encerramento gracioso
    const gracefulShutdown = (signal) => {
      console.log(`🔄 Recebido ${signal} - Iniciando encerramento gracioso...`);

      server.close((error) => {
        if (error) {
          console.error("❌ Erro ao fechar servidor:", error);
          process.exit(1);
        }

        console.log("✅ Servidor HTTP fechado");

        // Aqui você pode fechar conexões de banco, redis, etc.
        // Exemplo: dbPool.end(() => { process.exit(0); });

        console.log("✅ Encerramento gracioso concluído");
        process.exit(0);
      });

      // Força o encerramento após 30 segundos
      setTimeout(() => {
        console.error("⚠️ Forçando encerramento após timeout");
        process.exit(1);
      }, 30000);
    };

    // Registrar handlers para sinais do sistema
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Erro crítico ao inicializar servidor:", error);
    process.exit(1);
  }
};

// Inicializar servidor
startServer();