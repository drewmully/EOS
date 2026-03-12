import React from "react";

type Variant = "emerald" | "amber" | "red" | "blue" | "gray" | "indigo" | "teal" | "orange";

const styles: Record<Variant, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  gray: "bg-gray-100 text-gray-500",
  indigo: "bg-indigo-50 text-indigo-600",
  teal: "bg-teal-50 text-teal-600",
  orange: "bg-orange-50 text-orange-600",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({ children, variant = "gray", size = "sm", dot }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 font-medium whitespace-nowrap",
        styles[variant],
        size === "sm"
          ? "text-[11px] px-2 py-0.5 rounded-md"
          : "text-xs px-2.5 py-1 rounded-md",
      ].join(" ")}
    >
      {dot && <span className="w-1 h-1 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}
