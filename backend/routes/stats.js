const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const one = (sql, ...p) => db.prepare(sql).get(...p).n;
  res.json({
    totalEvents: one('SELECT COUNT(*) n FROM events'),
    upcomingEvents: one(`SELECT COUNT(*) n FROM events WHERE status='upcoming' AND event_date >= ?`, today),
    totalStaff: one('SELECT COUNT(*) n FROM staff WHERE active = 1'),
    onSiteNow: one(`SELECT COUNT(*) n FROM assignments WHERE status = 'checked_in'`),
    understaffed: db
      .prepare(
        `SELECT e.id, e.title, e.event_date, e.staff_needed,
          (SELECT COUNT(*) FROM assignments a WHERE a.event_id = e.id) AS assigned
         FROM events e
         WHERE e.status IN ('upcoming','live') AND e.event_date >= ? AND assigned < e.staff_needed
         ORDER BY e.event_date LIMIT 5`
      )
      .all(today),
    nextEvents: db
      .prepare(`SELECT * FROM events WHERE status IN ('upcoming','live') AND event_date >= ? ORDER BY event_date, start_time LIMIT 5`)
      .all(today),
  });
});

module.exports = router;
