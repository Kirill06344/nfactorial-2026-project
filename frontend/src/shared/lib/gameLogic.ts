import type { Board, Piece } from "@/shared/types";

export function dropPiece(
  board: Board,
  col: number,
  piece: Piece,
): Board | null {
  for (let row = 5; row >= 0; row--) {
    if (board[row][col] === 0) {
      const next = board.map((r) => [...r]) as Board;
      next[row][col] = piece;
      return next;
    }
  }
  return null; // column full
}

export function checkWin(board: Board, piece: Piece): boolean {
  // Horizontal
  for (let r = 0; r < 6; r++)
    for (let c = 0; c <= 3; c++)
      if ([0, 1, 2, 3].every((i) => board[r][c + i] === piece)) return true;
  // Vertical
  for (let c = 0; c < 7; c++)
    for (let r = 0; r <= 2; r++)
      if ([0, 1, 2, 3].every((i) => board[r + i][c] === piece)) return true;
  // Diagonal ↘
  for (let r = 0; r <= 2; r++)
    for (let c = 0; c <= 3; c++)
      if ([0, 1, 2, 3].every((i) => board[r + i][c + i] === piece)) return true;
  // Diagonal ↙
  for (let r = 0; r <= 2; r++)
    for (let c = 3; c < 7; c++)
      if ([0, 1, 2, 3].every((i) => board[r + i][c - i] === piece)) return true;
  return false;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== 0);
}
