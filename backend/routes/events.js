const router = require('express').Router();
const db = require('../db');

const withCounts = `
  SELECT e.*,
    (SELECT COUNT(*) FROM assignments a WHERE a.event_id = e.id) AS assigned_count,
    (SELECT COUNT(*) FROM assignments a WHERE a.event_id = e.id AND a.status = 'checked_in') AS checked_in_count
  FROM events e`;

const notify = (req, type) => req.app.get('io').emit('change', { type });

router.get('/', (req, res) => {
  res.json(db.prepare(`${withCounts} ORDER BY event_date DESC, start_time`).all());
});

router.get('/:id', (req, res) => {
  const ev = db.prepare(`${withCounts} WHERE e.id = ?`).get(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Event not found' });
  res.json(ev);
});

router.post('/', (req, res) => {
  const { title, venue, event_date, start_time, end_time, staff_needed = 1, notes = '' } = req.body;
  if (!title || !venue || !event_date || !start_time || !end_time)
    return res.status(400).json({ error: 'Title, venue, date, start and end time are required' });
  const info = db
    .prepare('INSERT INTO events (title,venue,event_date,start_time,end_time,staff_needed,notes) VALUES (?,?,?,?,?,?,?)')
    .run(title, venue, event_date, start_time, end_time, staff_needed, notes);
  notify(req, 'events');
  res.status(201).json(db.prepare(`${withCounts} WHERE e.id = ?`).get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const cur = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'Event not found' });
  const e = { ...cur, ...req.body };
  db.prepare(
    'UPDATE events SET title=?,venue=?,event_date=?,start_time=?,end_time=?,staff_needed=?,status=?,notes=? WHERE id=?'
  ).run(e.title, e.venue, e.event_date, e.start_time, e.end_time, e.staff_needed, e.status, e.notes, req.params.id);
  notify(req, 'events');
  res.json(db.prepare(`${withCounts} WHERE e.id = ?`).get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  notify(req, 'events');
  res.json({ ok: true });
});

module.exports = router;
