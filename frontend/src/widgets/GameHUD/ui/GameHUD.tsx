interface Props {
  currentPlayer: 1 | 2;
  yourPlayer: 1 | 2 | null;
  mode: "bot" | "online" | "local" | null;
}

export function GameTopBar({ currentPlayer, yourPlayer, mode }: Props) {
  const isYourTurn = yourPlayer === null || currentPlayer === yourPlayer;

  const label1 = getLabel(1, yourPlayer, mode);
  const label2 = getLabel(2, yourPlayer, mode);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        <PlayerBadge active={currentPlayer === 1} color="red" label={label1} />
        <div className="text-sm text-muted-foreground">VS</div>
        <PlayerBadge
          active={currentPlayer === 2}
          color="yellow"
          label={label2}
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {isYourTurn ? "Твой ход" : "Ход соперника"}
      </div>
    </div>
  );
}

function getLabel(
  piece: 1 | 2,
  yourPlayer: 1 | 2 | null,
  mode: "bot" | "online" | "local" | null,
): string {
  if (mode === "local") return piece === 1 ? "Игрок 1" : "Игрок 2";
  if (yourPlayer === null) return piece === 1 ? "Red" : "Yellow";
  if (piece === yourPlayer) return "Ты";
  return mode === "bot" ? "Бот" : "Соперник";
}

function PlayerBadge({
  active,
  color,
  label,
}: {
  active: boolean;
  color: "red" | "yellow";
  label: string;
}) {
  return (
    <div
      className={`
        flex items-center gap-3 rounded-full border px-4 py-2 transition-all
        ${active ? "border-border bg-muted" : "opacity-50"}
      `}
    >
      <div
        className={`h-3 w-3 rounded-full ${color === "red" ? "bg-red-400" : "bg-amber-400"}`}
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
