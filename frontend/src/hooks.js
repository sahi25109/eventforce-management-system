import { useEffect, useState, useCallback } from 'react';
import { api, socket } from './api.js';

// Loads data and reloads it whenever the server broadcasts a change
export function useLive(path, types = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api(path).then(setData).catch((e) => setError(e.message));
  }, [path]);

  useEffect(() => {
    load();
    const onChange = (msg) => (types.length === 0 || types.includes(msg.type)) && load();
    socket.on('change', onChange);
    return () => socket.off('change', onChange);
  }, [load]);

  return { data, error, reload: load };
}
