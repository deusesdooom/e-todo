
const db = require('../../config/db');

const getUserByEmailForAuth = async (email) => {
  // Select password hash to verify login
  const [users] = await db.query(
    'SELECT id, email, password, name, firstname, created_at FROM user WHERE email = ?',
    [email]
  );
  return users[0];
};

const createUser = async (email, hashedPassword, name, firstname) => {
  const [result] = await db.query(
    'INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, name, firstname]
  );
  return result.insertId;
};

module.exports = {
  getUserByEmailForAuth,
  createUser
};