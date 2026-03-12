import React from "react";

type Variant = "emerald" | "amber" | "red" | "blue" | "gray" | "indigo" | "teal" | "orange";

const styles: Record<Variant, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
  amber: "bg-amber-50 text-amber-700 border border-amber-200/50",
  red: "bg-red-50 text-red-700 border border-red-200/50",
  blue: "bg-blue-50 text-blue-700 border border-blue-200/50",
  gray: "bg-gray-100 text-gray-500 border border-gray-200/50",
  indigo: "bg-indigo-50 text-indigo-700 border border-indigo-200/50",
  teal: "bg-teal-50 text-teal-700 border border-teal-200/50",
  orange: "bg-orange-50 text-orange-700 border border-orange-200/50",
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
          ? "text-[11px] font-semibold px-2.5 py-0.5 rounded-lg"
          : "text-xs px-3 py-1 rounded-lg",
      ].join(" ")}
    >
      {dot && <span className="w-1 h-1 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}
