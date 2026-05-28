import { useEffect } from "react";
import { useGameStore } from "@/app/store/game.store";
import { wsClient } from "@/shared/api/ws-client";

export function useWsSync() {
  const { mode, roomId, setStatus, setYourPlayer, applyState } = useGameStore();

  useEffect(() => {
    if (mode !== "online" || !roomId) return;

    wsClient.connect(roomId, {
      onJoined(yourPiece) {
        setYourPlayer(yourPiece);
      },
      onWaiting() {
        setStatus("waiting");
      },
      onState(board, currentPlayer, winner, finished) {
        applyState(board, currentPlayer, winner, finished);
      },
      onOpponentLeft() {
        // Сброс до waiting — ждём нового соперника
        setStatus("waiting");
        useGameStore.setState({
          board: Array.from({ length: 6 }, () => Array(7).fill(0)) as any,
          currentPlayer: 1,
          winner: null,
        });
      },
      onError(message) {
        console.warn("[ws]", message);
      },
      onClose() {
        // можно показать тост "соединение потеряно"
      },
    });

    return () => {
      wsClient.disconnect();
    };
  }, [mode, roomId]); // eslint-disable-line react-hooks/exhaustive-deps
}
