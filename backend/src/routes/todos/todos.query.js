const db = require('../../config/db');

const getAllTodos = async () => {
  const [todos] = await db.query('SELECT * FROM todo ORDER BY due_time ASC');
  return todos;
};

const getTodoById = async (id) => {
  const [todos] = await db.query('SELECT * FROM todo WHERE id = ?', [id]);
  return todos[0];
};

const createTodo = async (title, description, due_time, user_id, status = 'not started') => {
  const [result] = await db.query(
    'INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)',
    [title, description, due_time, user_id, status]
  );
  return result.insertId;
};

const updateTodo = async (id, title, description, due_time, user_id, status) => {
  const [result] = await db.query(
    'UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?',
    [title, description, due_time, user_id, status, id]
  );
  return result;
};

const deleteTodo = async (id) => {
  const [result] = await db.query('DELETE FROM todo WHERE id = ?', [id]);
  return result;
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};