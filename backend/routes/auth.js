const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const sign = (u) =>
  jwt.sign({ id: u.id, name: u.name, role: u.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ error: 'Name, email and a password of 6+ characters are required' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(409).json({ error: 'That email is already registered' });
  const info = db
    .prepare('INSERT INTO users (name,email,password) VALUES (?,?,?)')
    .run(name, email, bcrypt.hashSync(password, 10));
  const user = { id: info.lastInsertRowid, name, role: 'manager' };
  res.status(201).json({ token: sign(user), user });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email || '');
  if (!u || !bcrypt.compareSync(password || '', u.password))
    return res.status(401).json({ error: 'Wrong email or password' });
  const user = { id: u.id, name: u.name, role: u.role };
  res.json({ token: sign(user), user });
});

module.exports = router;
