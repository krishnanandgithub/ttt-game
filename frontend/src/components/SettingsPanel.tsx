import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

type Props = {
  username?: string;
  onClose?: () => void;
};

export default function SettingsPanel({ username: initialUsername, onClose }: Props) {
  const { mode, setMode, palette, setPalette } = useTheme();
  const [username, setUsername] = useState(initialUsername || '');
  const [saving, setSaving] = useState(false);
  const backend = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:4000';

  useEffect(() => {
    setUsername(initialUsername || '');
  }, [initialUsername]);

  const location = useLocation();
  const onHome = location.pathname === '/';

  async function save() {
    setSaving(true);
    try {
      const payload = { username, mode, palette };
      localStorage.setItem('ttt_username', username);

      try {
        const w = window as any;
        if (w.__TTT_SOCKET && w.__TTT_SOCKET.connected) {
          w.__TTT_SOCKET.emit('saveSettings', payload);
          try {
            w.__TTT_SOCKET.username = username;
          } catch (e) {}
          window.dispatchEvent(new CustomEvent('ttt:applySettings', { detail: payload }));
        } else {
          await fetch(`${backend}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          window.dispatchEvent(new CustomEvent('ttt:applySettings', { detail: payload }));
        }
      } catch (e) {
        console.warn('could not save over socket, using HTTP', e);
        await fetch(`${backend}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        window.dispatchEvent(new CustomEvent('ttt:applySettings', { detail: payload }));
      }
    } finally {
      setSaving(false);
      try {
        window.dispatchEvent(
          new CustomEvent('ttt:toast', { detail: { message: 'Settings saved' } })
        );
      } catch (e) {}
      if (onClose) onClose();
    }
  }

  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      {!onHome && (
        <label>
          Username
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </label>
      )}
      <label>
        Mode
        <select value={mode} onChange={e => setMode(e.target.value as any)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>
        Palette
        <select value={palette} onChange={e => setPalette(e.target.value as any)}>
          <option value="default">Default</option>
          <option value="ocean">Ocean</option>
          <option value="sunset">Sunset</option>
        </select>
      </label>
      <div style={{ marginTop: 12 }}>
        <button onClick={save} disabled={saving || (!username && !onHome)}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => onClose && onClose()} style={{ marginLeft: 8 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
