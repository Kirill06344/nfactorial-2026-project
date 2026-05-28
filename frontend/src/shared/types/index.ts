export type Player = 1 | 2;
export type Piece = 0 | Player;
export type Board = Piece[][]; // [6][7]
export type GameMode = "bot" | "local" | "online";
export type GameStatus = "idle" | "waiting" | "playing" | "finished";

export interface User {
  id: string;
  username: string;
  email: string;
  wins: number;
  losses: number;
}

export interface Room {
  id: string;
  invite_code: string;
  status: "waiting" | "playing" | "finished";
  player1?: User;
  player2?: User;
}

// WS события
export type ServerEvent =
  | { type: "waiting" }
  | { type: "game_start"; board: Board; your_player: Player; opponent: User }
  | {
      type: "game_update";
      board: Board;
      next_player: Player;
      last_move: { col: number; row: number };
    }
  | { type: "game_over"; winner: Player | null; board: Board }
  | { type: "opponent_left" }
  | { type: "error"; message: string };

export type ClientEvent =
  | { type: "join_room"; room_id: string }
  | { type: "make_move"; column: number }
  | { type: "leave_room" };
