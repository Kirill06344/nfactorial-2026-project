import { useNavigate } from "react-router-dom";
import { useGameStore } from "@/app/store/game.store";
import { useMakeMove } from "@/features/make-move/model/useMakeMove";
import { useWsSync } from "@/features/online-game/model/useWsSync";

import { GameBoard } from "@/widgets/GameBoard/ui/GameBoard";
import { GameTopBar } from "@/widgets/GameHUD/ui/GameHUD";
import { GameOverModal } from "@/widgets/GameOverModal/ui/GameOverModal";

export default function GamePage() {
  const navigate = useNavigate();

  const {
    board,
    currentPlayer,
    yourPlayer,
    mode,
    winner,
    status,
    roomId,
    reset,
    startBot,
  } = useGameStore();

  // Синхронизация WebSocket для онлайн-режима
  useWsSync();

  const { move, isLoading } = useMakeMove(mode ?? "local");

  const isGameOver = winner !== null;

  // Блокируем доску: чужой ход, загрузка, ожидание
  const boardDisabled =
    isLoading ||
    status === "waiting" ||
    status === "finished" ||
    (mode !== "local" && yourPlayer !== null && currentPlayer !== yourPlayer);

  const exit = () => {
    reset();
    navigate("/");
  };

  const restart = mode === "bot" ? () => startBot(yourPlayer ?? 1) : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button onClick={exit} className="text-sm text-muted-foreground">
          ← выйти
        </button>

        <span className="text-sm text-muted-foreground uppercase tracking-wider">
          {mode}
        </span>

        {/* Код комнаты для онлайн режима */}
        {mode === "online" && roomId && (
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Скопировать код комнаты"
          >
            #{roomId} 📋
          </button>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-8">
        {status === "waiting" ? (
          <div className="text-center space-y-3">
            <p className="text-lg font-medium">Ожидание соперника...</p>
            {roomId && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Код комнаты:</p>
                <button
                  onClick={() => navigator.clipboard.writeText(roomId)}
                  className="rounded-xl border border-border px-6 py-3 font-mono text-2xl tracking-widest hover:bg-muted transition-colors"
                >
                  {roomId}
                </button>
                <p className="text-xs text-muted-foreground">
                  нажми чтобы скопировать
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <GameTopBar
              currentPlayer={currentPlayer}
              yourPlayer={yourPlayer}
              mode={mode}
            />

            <GameBoard
              board={board}
              onMove={boardDisabled ? () => {} : move}
              currentPlayer={currentPlayer}
            />
          </>
        )}
      </main>

      <GameOverModal
        open={isGameOver}
        winner={winner}
        yourPlayer={yourPlayer}
        onExit={exit}
        onRestart={restart}
      />
    </div>
  );
}
