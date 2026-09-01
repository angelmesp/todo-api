const express = require("express");
const todosRouter = require("./todos");

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 8080;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/todos", todosRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API de tareas escuchando en el puerto ${PORT}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

module.exports = app;
