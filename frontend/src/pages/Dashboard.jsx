import { Link } from 'react-router-dom';
import { useLive } from '../hooks.js';

export default function Dashboard() {
  const { data: s } = useLive('/stats');
  if (!s) return <p className="muted">Loading…</p>;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat"><b>{s.upcomingEvents}</b><span>Upcoming events</span></div>
        <div className="stat"><b>{s.totalStaff}</b><span>Active staff</span></div>
        <div className="stat live"><b>{s.onSiteNow}</b><span>On site right now</span></div>
        <div className="stat"><b>{s.totalEvents}</b><span>Events in total</span></div>
      </div>

      <div className="two">
        <section className="card">
          <h3>Next events</h3>
          {s.nextEvents.length === 0 && <p className="muted">No upcoming events. Create one from the Events page.</p>}
          {s.nextEvents.map((e) => (
            <Link key={e.id} to={`/events/${e.id}`} className="row">
              <div><b>{e.title}</b><div className="muted">{e.venue}</div></div>
              <div className="muted">{e.event_date} · {e.start_time}</div>
            </Link>
          ))}
        </section>

        <section className="card">
          <h3>Needs more staff</h3>
          {s.understaffed.length === 0 && <p className="muted">Every upcoming event is fully staffed.</p>}
          {s.understaffed.map((e) => (
            <Link key={e.id} to={`/events/${e.id}`} className="row">
              <div><b>{e.title}</b><div className="muted">{e.event_date}</div></div>
              <span className="pill warn">{e.assigned}/{e.staff_needed} assigned</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
