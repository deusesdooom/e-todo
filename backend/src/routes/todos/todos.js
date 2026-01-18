const express = require('express');
const auth = require('../../middleware/auth');
const {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
} = require('./todos.query');

const router = express.Router();

router.get('/todos', auth, async (req, res) => {
  try {
    const todos = await getAllTodos();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.get('/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await getTodoById(parseInt(id));

    if (!todo) {
      return res.status(404).json({ msg: 'Not found' });
    }

    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.post('/todos', auth, async (req, res) => {
  try {
    const { title, description, due_time, user_id, status } = req.body;

    if (!title || !description || !due_time || !user_id) {
      return res.status(400).json({ msg: 'Bad parameter' });
    }

    if (req.user.user.id !== user_id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const todoId = await createTodo(title, description, due_time, user_id, status || 'not started');
    const newTodo = await getTodoById(todoId);

    res.status(201).json(newTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.put('/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_time, user_id, status } = req.body;

    const todo = await getTodoById(parseInt(id));
    if (!todo) {
      return res.status(404).json({ msg: 'Not found' });
    }

    if (req.user.user.id !== todo.user_id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    if (!title || !description || !due_time || !user_id || !status) {
      return res.status(400).json({ msg: 'Bad parameter' });
    }

    await updateTodo(parseInt(id), title, description, due_time, user_id, status);
    const updatedTodo = await getTodoById(parseInt(id));

    res.json(updatedTodo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.delete('/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await getTodoById(parseInt(id));
    if (!todo) {
      return res.status(404).json({ msg: 'Not found' });
    }

    if (req.user.user.id !== todo.user_id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    await deleteTodo(parseInt(id));
    res.json({ msg: `Successfully deleted record number: ${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

module.exports = router;