import { useCallback, useState } from "react";
import { useGameStore } from "@/app/store/game.store";
import { gameApi } from "@/shared/api/gameApi";
import { wsClient } from "@/shared/api/ws-client";
import { dropPiece, checkWin, isBoardFull } from "@/shared/lib/gameLogic";
import type { GameMode } from "@/shared/types";

export function useMakeMove(mode: GameMode) {
  const { board, currentPlayer, yourPlayer, applyState } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);

  const move = useCallback(
    async (col: number) => {
      if (isLoading) return;

      if (mode === "bot") {
        if (currentPlayer !== yourPlayer) return; // ждём бота
        setIsLoading(true);
        try {
          const res = await gameApi.botMove(board, col, yourPlayer ?? 1);
          applyState(res.board, res.currentPlayer, res.winner, res.finished);
        } catch (e) {
          console.error("[bot-move]", e);
        } finally {
          setIsLoading(false);
        }
      } else if (mode === "online") {
        wsClient.move(col); // валидация на бэкенде
      } else {
        // local — два игрока на одном устройстве, логика на клиенте
        const next = dropPiece(board, col, currentPlayer);
        if (!next) return; // колонка полна

        const won = checkWin(next, currentPlayer);
        const draw = !won && isBoardFull(next);
        const nextPlayer: 1 | 2 = currentPlayer === 1 ? 2 : 1;

        applyState(next, nextPlayer, won ? currentPlayer : 0, won || draw);
      }
    },
    [mode, board, currentPlayer, yourPlayer, isLoading, applyState],
  );

  return { move, isLoading };
}
