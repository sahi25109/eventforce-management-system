const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const auth = require('./middleware/auth');
require('./db');

const app = express();
const server = http.createServer(app);
const origin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, { cors: { origin } });

app.use(cors({ origin }));
app.use(express.json());
app.set('io', io);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', auth, require('./routes/events'));
app.use('/api/staff', auth, require('./routes/staff'));
app.use('/api/assignments', auth, require('./routes/assignments'));
app.use('/api/stats', auth, require('./routes/stats'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Serve the built frontend in production
const dist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(dist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(dist, 'index.html'), (err) => err && next());
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`EventForce API running on http://localhost:${PORT}`));
