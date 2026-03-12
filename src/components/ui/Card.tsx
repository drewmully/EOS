import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const padStyles: Record<string, React.CSSProperties> = {
  none: {},
  sm: { padding: 20 },
  md: { padding: 24 },
  lg: { padding: "24px 28px" },
};

export function Card({ children, className = "", onClick, hoverable, padding = "md" }: CardProps) {
  const interactive = hoverable || !!onClick;
  return (
    <div
      onClick={onClick}
      style={padStyles[padding]}
      className={[
        "bg-white rounded-2xl border border-gray-200/70",
        "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]",
        interactive
          ? "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
