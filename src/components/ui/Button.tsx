import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-200/50",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100",
  ghost:
    "text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-150",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Button({ children, variant = "primary", size = "md", icon, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-1.5 font-semibold rounded-[10px] cursor-pointer",
        "transition-all duration-150 active:scale-[0.97]",
        variants[variant],
        size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2",
        className,
      ].join(" ")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
