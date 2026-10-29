import { useState } from 'react';
import { api } from '../api.js';
import { useLive } from '../hooks.js';

const ROLES = ['Usher', 'Security', 'Caterer', 'Technician', 'Coordinator', 'Driver', 'Hospitality'];
const empty = { name: '', email: '', phone: '', role: 'Usher', hourly_rate: 15 };

export default function Staff() {
  const { data: staff, reload } = useLive('/staff', ['staff']);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/staff', { method: 'POST', body: { ...form, hourly_rate: Number(form.hourly_rate) } });
      setForm(empty);
      setOpen(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (s) => {
    await api(`/staff/${s.id}`, { method: 'PUT', body: { active: s.active ? 0 : 1 } });
    reload();
  };

  const remove = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    await api(`/staff/${id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <div className="head">
        <h2>Staff</h2>
        <button className="btn" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Add staff'}</button>
      </div>

      {open && (
        <form className="card form" onSubmit={create}>
          <label>Name<input value={form.name} onChange={set('name')} required /></label>
          <label>Role
            <select value={form.role} onChange={set('role')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
          <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
          <label>Hourly rate<input type="number" min="0" step="0.5" value={form.hourly_rate} onChange={set('hourly_rate')} /></label>
          {error && <p className="error wide">{error}</p>}
          <button className="btn wide">Save staff member</button>
        </form>
      )}

      {!staff && <p className="muted">Loading…</p>}
      {staff?.length === 0 && <p className="muted">No staff yet. Select “Add staff” to build your team.</p>}

      <div className="list">
        {staff?.map((s) => (
          <div key={s.id} className={`card crew ${s.active ? '' : 'off'}`}>
            <div>
              <b>{s.name}</b>
              <div className="muted">{s.role} · ${s.hourly_rate}/hr</div>
              <div className="muted">{[s.phone, s.email].filter(Boolean).join(' · ')}</div>
            </div>
            <div className="event-side">
              <button className="link" onClick={() => toggle(s)}>{s.active ? 'Set inactive' : 'Set active'}</button>
              <button className="link danger" onClick={() => remove(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
