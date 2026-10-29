const router = require('express').Router();
const db = require('../db');

const notify = (req) => req.app.get('io').emit('change', { type: 'staff' });

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM staff ORDER BY name').all());
});

router.post('/', (req, res) => {
  const { name, email = '', phone = '', role, hourly_rate = 0 } = req.body;
  if (!name || !role) return res.status(400).json({ error: 'Name and role are required' });
  const info = db
    .prepare('INSERT INTO staff (name,email,phone,role,hourly_rate) VALUES (?,?,?,?,?)')
    .run(name, email, phone, role, hourly_rate);
  notify(req);
  res.status(201).json(db.prepare('SELECT * FROM staff WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const cur = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'Staff member not found' });
  const s = { ...cur, ...req.body };
  db.prepare('UPDATE staff SET name=?,email=?,phone=?,role=?,hourly_rate=?,active=? WHERE id=?').run(
    s.name, s.email, s.phone, s.role, s.hourly_rate, s.active ? 1 : 0, req.params.id
  );
  notify(req);
  res.json(db.prepare('SELECT * FROM staff WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
  notify(req);
  res.json({ ok: true });
});

module.exports = router;
