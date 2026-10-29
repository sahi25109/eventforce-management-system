import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { getToken, getUser, clearSession } from './api.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Staff from './pages/Staff.jsx';

function Shell({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const logout = () => {
    clearSession();
    navigate('/login');
  };
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">EventForce</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/staff">Staff</NavLink>
        </nav>
        <div className="who">
          <span>{user?.name}</span>
          <button className="link" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

const Private = ({ children }) => (getToken() ? <Shell>{children}</Shell> : <Navigate to="/login" replace />);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/events" element={<Private><Events /></Private>} />
      <Route path="/events/:id" element={<Private><EventDetail /></Private>} />
      <Route path="/staff" element={<Private><Staff /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
