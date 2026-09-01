const express = require("express");
const store = require("./store");

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

router.get("/", (_req, res) => {
  res.status(200).json(store.listTodos());
});

router.get("/:id", (req, res) => {
  const todo = store.findTodoById(req.params.id);
  if (!todo) {
    res.status(404).json({ error: "Tarea no encontrada" });
    return;
  }
  res.status(200).json(todo);
});

router.post("/", (req, res) => {
  const { title, completed } = req.body || {};

  if (!isNonEmptyString(title)) {
    res.status(400).json({ error: "El campo title es obligatorio" });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ error: "El campo completed debe ser boolean" });
    return;
  }

  const todo = store.createTodo(title, completed);
  res.status(201).json(todo);
});

router.put("/:id", (req, res) => {
  const { title, completed } = req.body || {};

  if (title !== undefined && !isNonEmptyString(title)) {
    res.status(400).json({ error: "El campo title no puede estar vacío" });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ error: "El campo completed debe ser boolean" });
    return;
  }

  if (title === undefined && completed === undefined) {
    res.status(400).json({ error: "Debe enviar title o completed para actualizar" });
    return;
  }

  const updated = store.updateTodo(req.params.id, { title, completed });
  if (!updated) {
    res.status(404).json({ error: "Tarea no encontrada" });
    return;
  }

  res.status(200).json(updated);
});

router.delete("/:id", (req, res) => {
  const deleted = store.deleteTodo(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Tarea no encontrada" });
    return;
  }
  res.status(204).send();
});

module.exports = router;
