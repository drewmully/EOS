import React from "react";

type Variant = "emerald" | "amber" | "red" | "blue" | "gray" | "indigo" | "teal" | "orange";

const styles: Record<Variant, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/60",
  red: "bg-red-50 text-red-700 ring-red-200/60",
  blue: "bg-blue-50 text-blue-700 ring-blue-200/60",
  gray: "bg-gray-100 text-gray-600 ring-gray-200/60",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/60",
  teal: "bg-teal-50 text-teal-700 ring-teal-200/60",
  orange: "bg-orange-50 text-orange-700 ring-orange-200/60",
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
        "inline-flex items-center gap-1.5 font-semibold ring-1 ring-inset",
        styles[variant],
        size === "sm" ? "text-[11px] px-2 py-0.5 rounded-md" : "text-xs px-2.5 py-1 rounded-lg",
      ].join(" ")}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
