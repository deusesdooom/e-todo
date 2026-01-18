const db = require('../../config/db');

const getUserById = async (id) => {
  const [users] = await db.query(
    'SELECT id, email, password, name, firstname, created_at FROM user WHERE id = ?',
    [id]
  );
  return users[0];
};

const getUserByEmail = async (email) => {
  const [users] = await db.query(
    'SELECT id, email, password, name, firstname, created_at FROM user WHERE email = ?',
    [email]
  );
  return users[0];
};

const getUserTodos = async (userId) => {
  const [todos] = await db.query(
    'SELECT * FROM todo WHERE user_id = ? ORDER BY due_time ASC',
    [userId]
  );
  return todos;
};

const updateUser = async (id, email, password, name, firstname) => {
  const [result] = await db.query(
    'UPDATE user SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?',
    [email, password, name, firstname, id]
  );
  return result;
};

const deleteUser = async (id) => {
  const [result] = await db.query('DELETE FROM user WHERE id = ?', [id]);
  return result;
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserTodos,
  updateUser,
  deleteUser
};