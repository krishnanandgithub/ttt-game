import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import SettingsPanel from './SettingsPanel';
import ToastHost from './ToastHost';

export default function ThemeSwitcher() {
  const { mode, palette } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const showSettings = location.pathname.startsWith('/game');
  const currentUsername =
    typeof window !== 'undefined' ? localStorage.getItem('ttt_username') || '' : '';

  return (
    <div className="theme-switcher">
      <div className="theme-controls">
        {showSettings && (
          <button className="settings-button" onClick={() => setOpen(true)} aria-haspopup="dialog">
            Settings
          </button>
        )}
        <div className="theme-indicator" aria-hidden>
          {mode === 'dark' ? '🌙' : '☀️'} {palette}
        </div>
      </div>
      {open && <SettingsPanel username={currentUsername} onClose={() => setOpen(false)} />}
      <ToastHost />
    </div>
  );
}
