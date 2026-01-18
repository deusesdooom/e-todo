CREATE DATABASE IF NOT EXISTS etodo;
USE etodo;

CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_time DATETIME NOT NULL,
  status ENUM('not started', 'todo', 'in progress', 'done') DEFAULT 'not started',
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_todo_user_id ON todo(user_id);
CREATE INDEX idx_todo_status ON todo(status);