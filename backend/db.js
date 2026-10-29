const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // built into Node.js 22.5+ (no extra install)
const bcrypt = require('bcryptjs');

const db = new DatabaseSync(path.join(__dirname, 'eventforce.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'manager',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  staff_needed INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'upcoming',   -- upcoming | live | completed | cancelled
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL,                        -- Usher, Security, Caterer, Technician...
  hourly_rate REAL NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'assigned',   -- assigned | checked_in | checked_out
  checked_in_at TEXT,
  checked_out_at TEXT,
  UNIQUE(event_id, staff_id)
);
`);

// Seed default admin
const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventforce.com';
if (!db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)) {
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)').run(
    'Admin',
    adminEmail,
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
    'admin'
  );
  console.log(`Default admin created: ${adminEmail}`);
}

module.exports = db;
