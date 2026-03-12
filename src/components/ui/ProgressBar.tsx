interface ProgressBarProps {
  value: number;
  color?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function ProgressBar({ value, color = "#10B981", size = "sm", showLabel }: ProgressBarProps) {
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 ${h} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${Math.max(value, 0)}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-400 tabular-nums min-w-[32px] text-right">{value}%</span>
      )}
    </div>
  );
}
