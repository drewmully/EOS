import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg" | "xl";
}

const paddings = { sm: "p-5", md: "p-7", lg: "p-8", xl: "p-10" };

export function Card({ children, className = "", onClick, hoverable, padding = "md" }: CardProps) {
  const interactive = hoverable || !!onClick;
  return (
    <div
      onClick={onClick}
      className={[
        "bg-white rounded-2xl border border-gray-200/70",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
        paddings[padding],
        interactive
          ? "cursor-pointer transition-all duration-200 hover:shadow-[0_16px_48px_rgba(0,0,0,0.09),0_6px_16px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:border-gray-300 active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
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
