import checkMove from '../src/game/checkMove';

test('valid move on empty board', () => {
  const res = checkMove({
    board: '---------',
    index: 0,
    mark: 'X',
    expectedNextTurn: 'X',
  });
  expect(res.valid).toBe(true);
  expect(res.newBoard[0]).toBe('X');
  expect(res.nextTurn).toBe('O');
});

test('index out of range', () => {
  const res = checkMove({ board: '---------', index: 9, mark: 'X' } as any);
  expect(res.valid).toBe(false);
  expect(res.reason).toMatch(/range/);
});

test('cell occupied', () => {
  const res = checkMove({ board: 'X--------', index: 0, mark: 'O' } as any);
  expect(res.valid).toBe(false);
  expect(res.reason).toMatch(/occupied/);
});

test('wrong expectedNextTurn', () => {
  const res = checkMove({
    board: '---------',
    index: 0,
    mark: 'O',
    expectedNextTurn: 'X',
  } as any);
  expect(res.valid).toBe(false);
  expect(res.reason).toMatch(/not your turn/);
});

test('X wins first row', () => {
  const board = 'XX-OO----';
  const res = checkMove({
    board,
    index: 2,
    mark: 'X',
    expectedNextTurn: 'X',
  } as any);
  expect(res.valid).toBe(true);
  expect(res.winner).toBe('X');
  expect(res.draw).toBe(false);
});

test('draw detection', () => {
  const board = 'XOXOOXXXO';

  const res = checkMove({ board, index: 8, mark: 'O' } as any);
  expect(res.valid).toBe(false);
});
