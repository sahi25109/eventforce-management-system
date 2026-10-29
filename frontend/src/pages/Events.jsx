import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLive } from '../hooks.js';

const empty = { title: '', venue: '', event_date: '', start_time: '09:00', end_time: '17:00', staff_needed: 5, notes: '' };

export default function Events() {
  const { data: events, reload } = useLive('/events', ['events', 'assignments']);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/events', { method: 'POST', body: { ...form, staff_needed: Number(form.staff_needed) } });
      setForm(empty);
      setOpen(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this event and its staff assignments?')) return;
    await api(`/events/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <div className="head">
        <h2>Events</h2>
        <button className="btn" onClick={() => setOpen(!open)}>{open ? 'Close' : 'New event'}</button>
      </div>

      {open && (
        <form className="card form" onSubmit={create}>
          <label>Title<input value={form.title} onChange={set('title')} required /></label>
          <label>Venue<input value={form.venue} onChange={set('venue')} required /></label>
          <label>Date<input type="date" value={form.event_date} onChange={set('event_date')} required /></label>
          <label>Start<input type="time" value={form.start_time} onChange={set('start_time')} required /></label>
          <label>End<input type="time" value={form.end_time} onChange={set('end_time')} required /></label>
          <label>Staff needed<input type="number" min="1" value={form.staff_needed} onChange={set('staff_needed')} /></label>
          <label className="wide">Notes<textarea value={form.notes} onChange={set('notes')} rows={2} /></label>
          {error && <p className="error wide">{error}</p>}
          <button className="btn wide">Save event</button>
        </form>
      )}

      {!events && <p className="muted">Loading…</p>}
      {events?.length === 0 && <p className="muted">No events yet. Select “New event” to add your first one.</p>}

      <div className="list">
        {events?.map((e) => (
          <div key={e.id} className="card event">
            <Link to={`/events/${e.id}`} className="event-main">
              <b>{e.title}</b>
              <span className="muted">{e.venue}</span>
              <span className="muted">{e.event_date} · {e.start_time}–{e.end_time}</span>
            </Link>
            <div className="event-side">
              <span className={`pill ${e.status}`}>{e.status}</span>
              <span className={`pill ${e.assigned_count < e.staff_needed ? 'warn' : 'ok'}`}>
                {e.assigned_count}/{e.staff_needed} staff
              </span>
              <button className="link danger" onClick={() => remove(e.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
