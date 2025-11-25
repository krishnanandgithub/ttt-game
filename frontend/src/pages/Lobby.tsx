import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('ttt_username');
    if (saved) setUsername(saved);
  }, []);

  function join() {
    navigate('/game', { state: { username } });
  }

  return (
    <div className="container">
      <h1>Tic-Tac-Toe Lobby</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your name" />
      <button onClick={join} disabled={!username}>
        Join Game
      </button>
    </div>
  );
}
