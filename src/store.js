const { randomUUID } = require("node:crypto");

const todos = [];

function listTodos() {
  return [...todos];
}

function findTodoById(id) {
  return todos.find((todo) => todo.id === id) || null;
}

function createTodo(title, completed = false) {
  const now = new Date().toISOString();
  const todo = {
    id: randomUUID(),
    title: title.trim(),
    completed: Boolean(completed),
    createdAt: now,
    updatedAt: now,
  };
  todos.push(todo);
  return todo;
}

function updateTodo(id, changes) {
  const todo = findTodoById(id);
  if (!todo) {
    return null;
  }

  if (typeof changes.title === "string") {
    todo.title = changes.title.trim();
  }

  if (typeof changes.completed === "boolean") {
    todo.completed = changes.completed;
  }

  todo.updatedAt = new Date().toISOString();
  return todo;
}

function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return false;
  }
  todos.splice(index, 1);
  return true;
}

module.exports = {
  listTodos,
  findTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
};
