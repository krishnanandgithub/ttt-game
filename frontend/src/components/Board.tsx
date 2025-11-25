import React, { useRef } from 'react';

type Props = {
  board: string;
  onClick: (i: number) => void;
  disabled?: boolean;
  winningLine?: number[] | null;
};

export default function Board({ board, onClick, disabled, winningLine }: Props) {
  const cells = board.split('');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: React.KeyboardEvent, idx: number) {
    if (disabled) return;
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = row * 3 + ((col + 1) % 3);
    if (e.key === 'ArrowLeft') nextIdx = row * 3 + ((col + 2) % 3);
    if (e.key === 'ArrowDown') nextIdx = ((row + 1) % 3) * 3 + col;
    if (e.key === 'ArrowUp') nextIdx = ((row + 2) % 3) * 3 + col;
    if (nextIdx !== idx) {
      const el = refs.current[nextIdx];
      if (el) el.focus();
      e.preventDefault();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onClick(idx);
    }
  }

  return (
    <div className="board" role="grid" aria-label="Tic Tac Toe board">
      {cells.map((c, i) => {
        const isWinning = !!(winningLine && winningLine.includes(i));
        return (
          <button
            key={i}
            ref={el => (refs.current[i] = el)}
            className={`cell ${isWinning ? 'winning' : ''}`}
            onClick={() => !disabled && onClick(i)}
            onKeyDown={e => onKeyDown(e, i)}
            tabIndex={0}
            role="button"
            aria-label={`Square ${i + 1} ${c === '-' ? 'empty' : c}`}
          >
            {c === '-' ? '' : c}
          </button>
        );
      })}
    </div>
  );
}
