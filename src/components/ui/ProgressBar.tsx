interface ProgressBarProps {
  value: number;
  color?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function ProgressBar({ value, color = "#10B981", size = "sm", showLabel }: ProgressBarProps) {
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 ${h} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${Math.max(value, 0)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: value > 0 ? `0 0 8px ${color}40` : "none",
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-gray-500 tabular-nums w-8 text-right">{value}%</span>
      )}
    </div>
  );
}
