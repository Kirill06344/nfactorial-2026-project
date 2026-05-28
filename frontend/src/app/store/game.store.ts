import { create } from "zustand";
import type { Board, GameMode, GameStatus } from "@/shared/types";

export type BotDifficulty = "easy" | "medium" | "hard" | "impossible";

const EMPTY_BOARD: Board = Array.from(
  { length: 6 },
  () => Array(7).fill(0) as number[],
) as Board;

interface GameStore {
  board: Board;
  currentPlayer: 1 | 2;
  yourPlayer: 1 | 2 | null;
  mode: GameMode | null;
  winner: 0 | 1 | 2 | null;
  status: GameStatus;
  roomId: string | null;

  botDifficulty: BotDifficulty;
  setBotDifficulty: (d: BotDifficulty) => void;

  applyState: (
    board: Board,
    currentPlayer: 1 | 2,
    winner: 0 | 1 | 2,
    finished: boolean,
  ) => void;

  setStatus: (s: GameStatus) => void;
  setYourPlayer: (piece: 1 | 2) => void;
  setRoomId: (id: string) => void;

  startBot: (yourPiece?: 1 | 2) => void;
  startOnline: () => void;
  startLocal: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  board: EMPTY_BOARD,
  currentPlayer: 1,
  yourPlayer: null,
  mode: null,
  winner: null,
  status: "idle",
  roomId: null,

  botDifficulty: "medium",

  setBotDifficulty: (botDifficulty) => set({ botDifficulty }),

  applyState: (board, currentPlayer, winner, finished) =>
    set({
      board: board as Board,
      currentPlayer,
      winner: finished ? winner : null,
      status: finished ? "finished" : "playing",
    }),

  setStatus: (status) => set({ status }),
  setYourPlayer: (yourPlayer) => set({ yourPlayer }),
  setRoomId: (roomId) => set({ roomId }),

  startBot: (yourPiece = 1) =>
    set({
      board: EMPTY_BOARD,
      currentPlayer: 1,
      yourPlayer: yourPiece,
      mode: "bot",
      winner: null,
      status: "playing",
      roomId: null,
    }),

  startOnline: () =>
    set({
      board: EMPTY_BOARD,
      currentPlayer: 1,
      yourPlayer: null,
      mode: "online",
      winner: null,
      status: "waiting",
      roomId: null,
    }),

  startLocal: () =>
    set({
      board: EMPTY_BOARD,
      currentPlayer: 1,
      yourPlayer: 1,
      mode: "local",
      winner: null,
      status: "playing",
      roomId: null,
    }),

  reset: () =>
    set({
      board: EMPTY_BOARD,
      currentPlayer: 1,
      yourPlayer: null,
      mode: null,
      winner: null,
      status: "idle",
      roomId: null,
    }),
}));
