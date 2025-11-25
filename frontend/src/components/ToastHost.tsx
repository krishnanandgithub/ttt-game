import React, { useEffect, useState } from 'react';

export default function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    function onToast(e: Event) {
      const d = (e as CustomEvent).detail as { message?: string } | undefined;
      if (!d || !d.message) return;
      setMsg(d.message);
      window.setTimeout(() => setMsg(null), 2500);
    }
    window.addEventListener('ttt:toast', onToast as EventListener);
    return () => window.removeEventListener('ttt:toast', onToast as EventListener);
  }, []);

  if (!msg) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      {msg}
    </div>
  );
}
