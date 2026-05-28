interface Props {
  value: 0 | 1 | 2;
  onClick?: () => void;
}

export function BoardCell({ value, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-background
        transition-transform
        hover:scale-[1.03]
        md:h-16
        md:w-16
      "
    >
      <div
        className={`
          h-11
          w-11
          md:h-13
          md:w-13
          rounded-full
          transition-all
          duration-200

          ${value === 0 ? "bg-muted" : ""}

          ${
            value === 1
              ? "bg-red-400 shadow-[0_0_20px_rgba(248,113,113,0.35)]"
              : ""
          }

          ${
            value === 2
              ? "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
              : ""
          }
        `}
      />
    </button>
  );
}
