# EventForce – Event & Workforce Management System

Plan events, build your crew, and track who is on site in real time.

**Tech stack:** React (Vite) · Node.js 22.5+ + Express · Socket.IO · SQLite (built-in node:sqlite) · JWT auth

## Features
- Login / register with JWT authentication
- Create, view and delete events (venue, date, time, staff needed, status)
- Staff directory with roles, hourly rates and active/inactive status
- Assign staff to events, with **double-booking protection**
- One-tap **check in / check out** attendance
- **Real-time updates** across all open screens using Socket.IO
- Dashboard: upcoming events, active staff, people on site, events that need more staff

## Folder structure
```
eventforce-management-system/
├── backend/        Express API, SQLite database, Socket.IO
├── frontend/       React app (Vite)
├── .env.example    Environment variable template
├── .gitignore
├── package.json    Root scripts (run both apps together)
└── README.md
```

## Getting started
```bash
# 1. Install everything
npm run install:all

# 2. Create your environment file
cp .env.example .env        # Windows: copy .env.example .env

# 3. Start backend (port 5000) and frontend (port 5173)
npm run dev
```
Open http://localhost:5173 and log in with the admin from your `.env`
(default: `admin@eventforce.com` / `admin123`).

## Production build
```bash
npm run build     # builds frontend into frontend/dist
npm start         # Express serves the API and the built frontend on PORT
```

## API overview
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login`, `/api/auth/register` | Authentication |
| GET/POST | `/api/events` | List / create events |
| GET/PUT/DELETE | `/api/events/:id` | Read / update / delete an event |
| GET/POST | `/api/staff` | List / add staff |
| PUT/DELETE | `/api/staff/:id` | Update / remove staff |
| GET | `/api/assignments/event/:eventId` | Crew for an event |
| POST | `/api/assignments` | Assign staff to an event |
| PATCH | `/api/assignments/:id/checkin` · `/checkout` | Attendance |
| DELETE | `/api/assignments/:id` | Remove from event |
| GET | `/api/stats` | Dashboard numbers |

## Database tables
`users`, `events`, `staff`, `assignments` (created automatically on first run).

## Upload to GitHub
```bash
git init
git add .
git commit -m "Initial commit: EventForce Management System"
git branch -M master
git remote add origin https://github.com/<your-username>/eventforce-management-system.git
git push -u origin master
```
