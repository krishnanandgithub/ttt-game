type Result = {
  valid: boolean;
  newBoard: string;
  winner: string | null;
  draw: boolean;
  nextTurn: string | null;
  winningLine?: number[] | null;
  reason?: string;
};

function isValidBoard(board: unknown): boolean {
  return typeof board === 'string' && board.length === 9 && /^[XO-]{9}$/.test(board);
}

function checkWinner(board: string): {
  winner: string | null;
  winningLine: number[] | null;
} {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] !== '-' && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }
  return { winner: null, winningLine: null };
}

function applyMove(board: string, index: number, mark: string) {
  const arr = board.split('');
  arr[index] = mark;
  return arr.join('');
}

export default function checkMove({
  board,
  index,
  mark,
  expectedNextTurn = null,
}: {
  board: string;
  index: number;
  mark: string;
  expectedNextTurn?: string | null;
}): Result {
  if (!isValidBoard(board)) {
    return {
      valid: false,
      newBoard: board,
      winner: null,
      draw: false,
      nextTurn: expectedNextTurn ?? null,
      reason: 'invalid board',
    };
  }
  if (!Number.isInteger(index) || index < 0 || index > 8) {
    return {
      valid: false,
      newBoard: board,
      winner: null,
      draw: false,
      nextTurn: expectedNextTurn ?? null,
      reason: 'index out of range',
    };
  }
  if (mark !== 'X' && mark !== 'O') {
    return {
      valid: false,
      newBoard: board,
      winner: null,
      draw: false,
      nextTurn: expectedNextTurn ?? null,
      reason: 'invalid mark',
    };
  }
  if (board[index] !== '-') {
    return {
      valid: false,
      newBoard: board,
      winner: null,
      draw: false,
      nextTurn: expectedNextTurn ?? null,
      reason: 'cell occupied',
    };
  }
  if (expectedNextTurn && mark !== expectedNextTurn) {
    return {
      valid: false,
      newBoard: board,
      winner: null,
      draw: false,
      nextTurn: expectedNextTurn ?? null,
      reason: 'not your turn',
    };
  }

  const newBoard = applyMove(board, index, mark);
  const { winner, winningLine } = checkWinner(newBoard);
  const draw = !winner && !newBoard.includes('-');
  const nextTurn = winner || draw ? null : mark === 'X' ? 'O' : 'X';

  return { valid: true, newBoard, winner, draw, nextTurn, winningLine };
}
