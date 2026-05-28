import { useState } from "react";

import type { Board } from "@/shared/types";

import { BoardCell } from "./BoardCell";

interface Props {
  board: Board;
  onMove: (col: number) => void;
  currentPlayer?: 1 | 2;
}

export function GameBoard({ board, onMove, currentPlayer = 1 }: Props) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* hover chip */}
      <div className="grid grid-cols-7 gap-2 px-3 mb-3">
        {Array.from({ length: 7 }).map((_, col) => (
          <div key={col} className="flex justify-center h-12">
            <div
              className={`
                  w-10 h-10 rounded-full
                  transition-all duration-150
                  ${
                    hoveredCol === col
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2"
                  }
                  ${currentPlayer === 1 ? "bg-red-400" : "bg-amber-400"}
                `}
            />
          </div>
        ))}
      </div>

      {/* board */}
      <div
        className="
          rounded-3xl
          border
          border-border/50
          bg-muted/40
          backdrop-blur
          p-4
          shadow-sm
        "
      >
        <div className="grid grid-cols-7 gap-2">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onMouseEnter={() => setHoveredCol(colIndex)}
              >
                <BoardCell value={cell} onClick={() => onMove(colIndex)} />
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
