const BASE_WS = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080";

// --- Типы входящих сообщений ---
type JoinedMsg = { type: "joined"; yourPiece: 1 | 2; roomId: string };
type WaitingMsg = { type: "waiting" };
type StateMsg = {
  type: "state";
  board: number[][];
  currentPlayer: 1 | 2;
  winner: 0 | 1 | 2;
  finished: boolean;
};
type OpponentLeftMsg = { type: "opponent_left" };
type ErrorMsg = { type: "error"; message: string };

export type WsServerMessage =
  | JoinedMsg
  | WaitingMsg
  | StateMsg
  | OpponentLeftMsg
  | ErrorMsg;

export interface WsHandlers {
  onJoined(yourPiece: 1 | 2, roomId: string): void;
  onWaiting(): void;
  onState(
    board: number[][],
    currentPlayer: 1 | 2,
    winner: 0 | 1 | 2,
    finished: boolean,
  ): void;
  onOpponentLeft(): void;
  onError(message: string): void;
  onClose(): void;
}

class GameWsClient {
  private ws: WebSocket | null = null;
  private handlers: Partial<WsHandlers> = {};

  connect(roomId: string, handlers: Partial<WsHandlers>): void {
    this.disconnect();
    this.handlers = handlers;
    this.ws = new WebSocket(`${BASE_WS}/ws/room/${roomId}`);

    this.ws.onmessage = (e) => {
      let msg: WsServerMessage;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      this.dispatch(msg);
    };

    this.ws.onclose = () => this.handlers.onClose?.();
    this.ws.onerror = (e) => console.error("[ws] error", e);
  }

  move(column: number): void {
    this.send({ type: "move", column });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.handlers = {};
  }

  private send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private dispatch(msg: WsServerMessage): void {
    switch (msg.type) {
      case "joined":
        this.handlers.onJoined?.(msg.yourPiece, msg.roomId);
        break;
      case "waiting":
        this.handlers.onWaiting?.();
        break;
      case "state":
        this.handlers.onState?.(
          msg.board,
          msg.currentPlayer,
          msg.winner,
          msg.finished,
        );
        break;
      case "opponent_left":
        this.handlers.onOpponentLeft?.();
        break;
      case "error":
        this.handlers.onError?.(msg.message);
        break;
    }
  }
}

// Singleton — один WS на всё приложение
export const wsClient = new GameWsClient();
