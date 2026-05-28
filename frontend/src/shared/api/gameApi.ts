const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface BotMoveResponse {
  board: Board;
  currentPlayer: 1 | 2;
  winner: 0 | 1 | 2;
  finished: boolean;
  botColumn: number;
}

// Import Board type — или дублируй если нет алиаса
type Board = number[][];

export const gameApi = {
  newGame: async (): Promise<{ board: Board; currentPlayer: 1 | 2 }> => {
    const res = await fetch(`${BASE}/api/game/new`);
    if (!res.ok) throw new Error("Failed to fetch new game");
    return res.json();
  },

  botMove: async (
    board: Board,
    column: number,
    playerPiece: 1 | 2,
    depth = 5,
  ): Promise<BotMoveResponse> => {
    const res = await fetch(`${BASE}/api/game/bot-move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, column, playerPiece, depth }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Move failed");
    return data;
  },
};
