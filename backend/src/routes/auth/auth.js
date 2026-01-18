const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmailForAuth, createUser } = require('./auth.query');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, firstname } = req.body;

    if (!email || !password || !name || !firstname) {
      return res.status(400).json({ msg: 'Bad parameter' });
    }

    let user = await getUserByEmailForAuth(email);
    if (user) {
      return res.status(409).json({ msg: 'Account already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await createUser(email, hashedPassword, name, firstname);

    const payload = {
      user: {
        id: userId,
        email: email,
        name: name,
        firstname: firstname,
      }
    };

    jwt.sign(
      payload,
      process.env.SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Bad parameter' });
    }

    const user = await getUserByEmailForAuth(email);
    if (!user) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstname: user.firstname,
      }
    };

    jwt.sign(
      payload,
      process.env.SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

module.exports = router;