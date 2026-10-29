import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLive } from '../hooks.js';

const STATUSES = ['upcoming', 'live', 'completed', 'cancelled'];

export default function EventDetail() {
  const { id } = useParams();
  const { data: ev, reload: reloadEvent } = useLive(`/events/${id}`, ['events', 'assignments']);
  const { data: crew, reload: reloadCrew } = useLive(`/assignments/event/${id}`, ['assignments']);
  const { data: staff } = useLive('/staff', ['staff']);
  const [staffId, setStaffId] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');

  if (!ev || !crew) return <p className="muted">Loading…</p>;

  const refresh = () => { reloadEvent(); reloadCrew(); };
  const assignedIds = new Set(crew.map((c) => c.staff_id));
  const available = (staff || []).filter((s) => s.active && !assignedIds.has(s.id));

  const assign = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/assignments', { method: 'POST', body: { event_id: Number(id), staff_id: Number(staffId), position } });
      setStaffId('');
      setPosition('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const act = async (path, method = 'PATCH') => {
    await api(path, { method });
    refresh();
  };

  const setStatus = async (status) => {
    await api(`/events/${id}`, { method: 'PUT', body: { status } });
    refresh();
  };

  return (
    <>
      <Link to="/events" className="link">← All events</Link>
      <div className="head">
        <div>
          <h2>{ev.title}</h2>
          <p className="muted">{ev.venue} · {ev.event_date} · {ev.start_time}–{ev.end_time}</p>
        </div>
        <select value={ev.status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {ev.notes && <p className="card">{ev.notes}</p>}

      <div className="stats">
        <div className="stat"><b>{ev.assigned_count}/{ev.staff_needed}</b><span>Assigned</span></div>
        <div className="stat live"><b>{ev.checked_in_count}</b><span>Checked in</span></div>
      </div>

      <form className="card inline" onSubmit={assign}>
        <select value={staffId} onChange={(e) => setStaffId(e.target.value)} required>
          <option value="">Choose staff member…</option>
          {available.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
        </select>
        <input placeholder="Position (e.g. Main gate)" value={position} onChange={(e) => setPosition(e.target.value)} />
        <button className="btn">Assign</button>
        {error && <p className="error wide">{error}</p>}
      </form>

      <h3>Crew</h3>
      {crew.length === 0 && <p className="muted">No one assigned yet. Pick a staff member above.</p>}
      <div className="list">
        {crew.map((c) => (
          <div key={c.id} className="card crew">
            <div>
              <b>{c.name}</b>
              <div className="muted">{c.role}{c.position ? ` · ${c.position}` : ''}</div>
              {c.checked_in_at && <div className="muted">In: {c.checked_in_at.slice(11, 16)}{c.checked_out_at && ` · Out: ${c.checked_out_at.slice(11, 16)}`}</div>}
            </div>
            <div className="event-side">
              <span className={`pill ${c.status}`}>{c.status.replace('_', ' ')}</span>
              {c.status === 'assigned' && <button className="btn small" onClick={() => act(`/assignments/${c.id}/checkin`)}>Check in</button>}
              {c.status === 'checked_in' && <button className="btn small alt" onClick={() => act(`/assignments/${c.id}/checkout`)}>Check out</button>}
              <button className="link danger" onClick={() => act(`/assignments/${c.id}`, 'DELETE')}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
