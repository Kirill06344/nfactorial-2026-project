import type { Board, Player, Piece } from "../../../shared/types";

export function makeLocalMove(board: Board, col: number, player: Player) {
  const newBoard = board.map((r) => [...r]);
  for (let row = 5; row >= 0; row--) {
    if (newBoard[row][col] === 0) {
      newBoard[row][col] = player as Piece;
      return { newBoard, row };
    }
  }
  return { newBoard, row: -1 };
}

export function checkWinner(board: Board): Player | null {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      const p = board[r][c];
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        let count = 1;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i,
            nc = c + dc * i;
          if (nr < 0 || nr > 5 || nc < 0 || nc > 6) break;
          if (board[nr][nc] !== p) break;
          count++;
        }
        if (count === 4) return p as Player;
      }
    }
  }
  return null;
}
