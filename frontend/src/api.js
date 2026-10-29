import { io } from 'socket.io-client';

export const getToken = () => localStorage.getItem('ef_token');
export const getUser = () => JSON.parse(localStorage.getItem('ef_user') || 'null');
export const saveSession = ({ token, user }) => {
  localStorage.setItem('ef_token', token);
  localStorage.setItem('ef_user', JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem('ef_token');
  localStorage.removeItem('ef_user');
};

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') {
    clearSession();
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// Single shared real-time connection
export const socket = io({ autoConnect: true });
