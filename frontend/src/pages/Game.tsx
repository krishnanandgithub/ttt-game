import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import useGameSocket from '../hooks/useGameSocket';

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialUsername =
    (location.state && (location.state as any).username) ||
    localStorage.getItem('ttt_username') ||
    'anon';

  const {
    connected,
    gameId,
    board,
    mark,
    status,
    nextTurn,
    winner,
    winningLine,
    opponent,
    error,
    connect,
    makeMove,
    leave,
    username,
  } = useGameSocket();

  useEffect(() => {
    connect(initialUsername);
    return () => {
      leave();
    };
  }, []);

  function onClickSquare(i: number) {
    if (status !== 'playing') return;
    if (!mark || mark !== nextTurn) return;
    makeMove(i);
  }

  function handleLeave() {
    leave();
    navigate('/');
  }

  const statusText = (() => {
    if (status === 'waiting') return 'Waiting for an opponent...';
    if (status === 'playing') return mark === nextTurn ? 'Your turn' : "Opponent's turn";
    if (status === 'finished') {
      if (winner === 'draw') return "It's a draw";
      if (!winner) return 'Game finished';
      return winner === mark ? 'You won!' : 'You lost.';
    }
    return status;
  })();

  return (
    <div className="container">
      <h2>Game Page</h2>
      <p>
        You are: <strong>{username || initialUsername}</strong> {mark ? `(mark: ${mark})` : ''}
      </p>
      <p>{opponent ? `Opponent: ${opponent.username}` : ''}</p>
      <p>Status: {statusText}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Board
        board={board}
        onClick={i => onClickSquare(i)}
        disabled={status !== 'playing' || !!winningLine}
        winningLine={winningLine}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={handleLeave}>Leave</button>
      </div>
    </div>
  );
}
