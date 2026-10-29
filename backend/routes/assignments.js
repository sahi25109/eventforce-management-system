const router = require('express').Router();
const db = require('../db');

const notify = (req, event_id) => req.app.get('io').emit('change', { type: 'assignments', event_id });

const rowQuery = `
  SELECT a.*, s.name, s.role, s.phone, s.hourly_rate
  FROM assignments a JOIN staff s ON s.id = a.staff_id`;

// Staff list for one event
router.get('/event/:eventId', (req, res) => {
  res.json(db.prepare(`${rowQuery} WHERE a.event_id = ? ORDER BY s.name`).all(req.params.eventId));
});

// Assign staff to event (prevents double-booking on same date)
router.post('/', (req, res) => {
  const { event_id, staff_id, position = '' } = req.body;
  const ev = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!ev) return res.status(404).json({ error: 'Event not found' });

  const clash = db
    .prepare(
      `SELECT e.title FROM assignments a JOIN events e ON e.id = a.event_id
       WHERE a.staff_id = ? AND e.event_date = ? AND e.id != ?
       AND e.status != 'cancelled' AND e.start_time < ? AND e.end_time > ?`
    )
    .get(staff_id, ev.event_date, event_id, ev.end_time, ev.start_time);
  if (clash) return res.status(409).json({ error: `Already booked for "${clash.title}" at that time` });

  try {
    db.prepare('INSERT INTO assignments (event_id,staff_id,position) VALUES (?,?,?)').run(event_id, staff_id, position);
  } catch {
    return res.status(409).json({ error: 'Staff member is already assigned to this event' });
  }
  notify(req, event_id);
  res.status(201).json({ ok: true });
});

router.patch('/:id/checkin', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found' });
  db.prepare(`UPDATE assignments SET status='checked_in', checked_in_at=datetime('now','localtime') WHERE id=?`).run(a.id);
  notify(req, a.event_id);
  res.json({ ok: true });
});

router.patch('/:id/checkout', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Assignment not found' });
  db.prepare(`UPDATE assignments SET status='checked_out', checked_out_at=datetime('now','localtime') WHERE id=?`).run(a.id);
  notify(req, a.event_id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const a = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (a) {
    db.prepare('DELETE FROM assignments WHERE id = ?').run(a.id);
    notify(req, a.event_id);
  }
  res.json({ ok: true });
});

module.exports = router;
