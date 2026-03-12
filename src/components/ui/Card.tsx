import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const pad = { none: "", sm: "p-4", md: "p-5", lg: "px-6 py-5" };

export function Card({ children, className = "", onClick, hoverable, padding = "md" }: CardProps) {
  const interactive = hoverable || !!onClick;
  return (
    <div
      onClick={onClick}
      className={[
        "bg-white rounded-xl border border-gray-200/80",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
        pad[padding],
        interactive
          ? "cursor-pointer transition-shadow duration-150 hover:shadow-md hover:border-gray-300"
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
