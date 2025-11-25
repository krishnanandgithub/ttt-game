export type PlayerMark = 'X' | 'O';
export type GameStatus = 'idle' | 'waiting' | 'playing' | 'finished';

export type GameState = {
  gameId: string;
  board: string;
  nextTurn: PlayerMark | null;
  status: GameStatus;
  winner?: PlayerMark | 'draw' | null;
  winningLine?: number[] | null;
};
