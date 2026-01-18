const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const {
  getUserById,
  getUserByEmail,
  getUserTodos,
  updateUser,
  deleteUser
} = require('./user.query');

const router = express.Router();

router.get('/user', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Not found' });
    }

    delete user.password;
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.get('/user/todos', auth, async (req, res) => {
  try {
    const todos = await getUserTodos(req.user.user.id);
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.get('/users/:idOrEmail', auth, async (req, res) => {
  try {
    const { idOrEmail } = req.params;
    let user;

    if (idOrEmail.includes('@')) {
      user = await getUserByEmail(idOrEmail);
    } else {
      user = await getUserById(parseInt(idOrEmail));
    }

    if (!user) {
      return res.status(404).json({ msg: 'Not found' });
    }

    // IMPORTANT: Security check - ensure only the authenticated user can view 
    // details about themselves OR other users (if this route is intended for admin/public viewing).
    // The specification implies this is intended for viewing any user's public profile,
    // but typically the password should still be removed.
    delete user.password;
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.put('/users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, name, firstname } = req.body;
    const userId = parseInt(id);

    if (req.user.user.id !== userId) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Not found' });
    }

    if (!email || !password || !name || !firstname) {
      return res.status(400).json({ msg: 'Bad parameter' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await updateUser(userId, email, hashedPassword, name, firstname);

    const updatedUser = await getUserById(userId);
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.delete('/users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (req.user.user.id !== userId) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Not found' });
    }
    
    await deleteUser(userId);
    res.json({ msg: `Successfully deleted record number: ${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

module.exports = router;