import { useEffect, useState } from 'react';

type Palette = 'default' | 'ocean' | 'sunset';

function applyClasses(mode: 'light' | 'dark', palette: Palette) {
  const el = document.documentElement;
  el.classList.remove('mode-light', 'mode-dark', 'theme-default', 'theme-ocean', 'theme-sunset');
  el.classList.add(mode === 'dark' ? 'mode-dark' : 'mode-light');
  el.classList.add(`theme-${palette}`);
}

export default function useTheme() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const v = localStorage.getItem('ttt_mode');
    return v === 'dark' ? 'dark' : 'light';
  });
  const [palette, setPalette] = useState<Palette>(() => {
    const v = localStorage.getItem('ttt_palette');
    return (v as Palette) || 'default';
  });

  useEffect(() => {
    applyClasses(mode, palette);
    localStorage.setItem('ttt_mode', mode);
    localStorage.setItem('ttt_palette', palette);
    try {
      const w = window as any;
      if (!w.__TTT_SOCKET) w.__TTT_SOCKET = null;
    } catch (e) {}
  }, [mode, palette]);

  useEffect(() => {
    function onApply(e: Event) {
      const d = (e as CustomEvent).detail as { mode?: string; palette?: string } | undefined;
      if (!d) return;
      if (d.mode === 'dark' || d.mode === 'light') setMode(d.mode);
      if (d.palette) setPalette(d.palette as any);
    }
    window.addEventListener('ttt:applySettings', onApply as EventListener);
    return () => window.removeEventListener('ttt:applySettings', onApply as EventListener);
  }, [setMode, setPalette]);

  return {
    mode,
    setMode,
    palette,
    setPalette,
  } as const;
}
